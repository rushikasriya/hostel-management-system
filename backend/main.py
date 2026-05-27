from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date
from application_properties import localhost

app = FastAPI()

app.add_middleware(CORSMiddleware,
                   allow_origins=["*"],
                   allow_credentials=True,
                   allow_methods=["*"],
                   allow_headers=["*"])


# --- Pydantic Models ---

class User(BaseModel):
    user_name: str
    contact_no: str | None = None
    role_id: int | None = None
    email_id: EmailStr
    password: str | None = "123456"
    status: str | None = "T"

class Login(BaseModel):
    email_id: EmailStr
    password: str

class Hostel(BaseModel):
    hostel_name: str | None = None
    hostel_code: str | None = None
    location_id: int | None = None
    status: str | None = None

class Block(BaseModel):
    hostel_id: int | None = None
    block_name: str
    manager_id: int | None = None
    block_incharge_id: int | None = None

class Floor(BaseModel):
    block_id: int
    floor_name: str
    incharge_id: int | None = None

class Room(BaseModel):
    floor_id: int
    room_no: str

class Bed(BaseModel):
    room_id: int
    bed_no: str
    status: Optional[str] = "Vacant"

class Tenant(BaseModel):
    tenant_name: str
    phone: Optional[str] = None
    emergency_phone: Optional[str] = None
    designation: Optional[str] = None
    address: Optional[str] = None
    bed_id: Optional[int] = None
    fee: Optional[float] = None
    joining_date: Optional[date] = None


# --- USERS ---

@app.post("/login")
def login_user(login: Login):
    db = localhost()
    cursor = db.cursor()
    query = """
    SELECT user_id, user_name, email_id, role_id, status
    FROM users
    WHERE email_id = ? AND password = ? AND status = 'T'
    """
    cursor.execute(query, (login.email_id, login.password))
    user = cursor.fetchone()
    cursor.close()
    db.close()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"message": "Login successful", "user": user}

@app.post("/addUser")
def create_user(user: User):
    db = localhost()
    cursor = db.cursor()
    default_password = 123456
    query = """
    INSERT INTO users (user_name, contact_no, role_id, email_id, password, status)
    VALUES (?, ?, ?, ?, ?, ?)
    """
    values = (user.user_name, user.contact_no, user.role_id, user.email_id, default_password, user.status)
    cursor.execute(query, values)
    db.commit()
    db.close()
    return {"message": "User created successfully"}

@app.get("/getUsers")
def get_users():
    db = localhost()
    cursor = db.cursor()
    query = """SELECT u.user_id, u.user_name, u.contact_no, u.email_id, u.role_id, r.role_name, u.status 
               FROM users u JOIN roles r ON r.id = u.role_id"""
    cursor.execute(query)
    users = cursor.fetchall()
    db.close()
    return users

@app.get("/getUserDetails/{user_id}")
def get_user(user_id: int):
    db = localhost()
    cursor = db.cursor()
    query = """SELECT u.user_id, u.user_name, u.contact_no, u.email_id, u.role_id, r.role_name, u.status 
               FROM users u JOIN roles r ON r.id = u.role_id WHERE user_id = ?"""
    cursor.execute(query, (user_id,))
    user = cursor.fetchone()
    db.close()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.put("/updateUser/{user_id}")
def update_user(user_id: int, user: User):
    db = localhost()
    cursor = db.cursor()
    query = """UPDATE users SET user_name = ?, contact_no = ?, role_id = ?, email_id = ?, status = ? WHERE user_id = ?"""
    values = (user.user_name, user.contact_no, user.role_id, user.email_id, user.status, user_id)
    cursor.execute(query, values)
    db.commit()
    db.close()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User updated successfully"}

@app.delete("/deactivateUser/{user_id}")
def delete_user(user_id: int):
    db = localhost()
    cursor = db.cursor()
    query = "update users set status = 'F' WHERE user_id = ?"
    cursor.execute(query, (user_id,))
    db.commit()
    db.close()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}

@app.get("/getRoles")
def get_roles():
    db = localhost()
    cursor = db.cursor()
    query = "SELECT * FROM roles"
    cursor.execute(query)
    roles = cursor.fetchall()
    db.close()
    return roles


# --- HOSTELS ---

@app.post("/addHostel")
def create_hostel(hostel: Hostel):
    db = localhost()
    cursor = db.cursor()
    
    h_code = hostel.hostel_code
    if not h_code and hostel.hostel_name:
        h_code = "".join([word[0].upper() for word in hostel.hostel_name.split() if word])
        
    query = "INSERT INTO hostels (hostel_name, hostel_code, location_id, status) VALUES (?, ?, ?, ?)"
    values = (hostel.hostel_name, h_code, hostel.location_id, 'T')
    cursor.execute(query, values)
    db.commit()
    db.close()
    return {"message": "Hostel created successfully"}

@app.get("/getHostels")
def get_hostels():
    db = localhost()
    cursor = db.cursor()
    query = "SELECT * FROM hostels"
    cursor.execute(query)
    hostels = cursor.fetchall()
    db.close()
    return hostels

@app.get("/getHostelDetails/{id}")
def get_hostel(id: int):
    db = localhost()
    cursor = db.cursor()
    query = "SELECT * FROM hostels WHERE id = ?"
    cursor.execute(query, (id,))
    hostel = cursor.fetchone()
    db.close()
    if not hostel:
        raise HTTPException(status_code=404, detail="Hostel not found")
    return hostel

@app.put("/updateHostelDetails/{id}")
def update_hostel(id: int, hostel: Hostel):
    db = localhost()
    cursor = db.cursor()
    
    h_code = hostel.hostel_code
    if not h_code and hostel.hostel_name:
        h_code = "".join([word[0].upper() for word in hostel.hostel_name.split() if word])
        
    query = "UPDATE hostels SET hostel_name = ?, hostel_code = ?, location_id = ?, status = ? WHERE id = ?"
    values = (hostel.hostel_name, h_code, hostel.location_id, hostel.status, id)
    cursor.execute(query, values)
    db.commit()
    db.close()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Hostel not found")
    return {"message": "Hostel updated successfully"}

@app.delete("/updateHostelStatus/{id}")
def delete_hostel(id: int):
    db = localhost()
    cursor = db.cursor()
    query = "update hostels set status = 'F' WHERE id = ?"
    cursor.execute(query, (id,))
    db.commit()
    db.close()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Hostel not found")
    return {"message": "Hostel deleted successfully"}


# --- FULL HOSTEL DETAILS (Previously port 1000) ---

@app.get("/getFullHostelDetails_1_0/{hostelId}")
def get_full_hostel_details(hostelId: int):
    conn = localhost()
    cursor = conn.cursor()
    try:
        query = f"""SELECT h.id AS hostelId, h.hostel_name, h.location_id, b.id as blockId, b.block_name, u1.user_name AS manager,
                f.id as floorId, f.floor_name, u2.user_name AS floorIncharge, r.id as roomId, r.room_no, bd.id as bedId, 
                bd.bed_no, bd.status, 
                t.tenant_name, t.phone, t.emergency_phone, t.designation, t.address, t.fee, t.joining_date FROM hostels h
                JOIN blocks b ON h.id = b.hostel_id
                LEFT JOIN users u1 ON u1.user_id = b.block_incharge_id
                JOIN floors f ON b.id = f.block_id
                LEFT JOIN users u2 ON u2.user_id = f.incharge_id
                JOIN rooms r ON f.id = r.floor_id
                JOIN beds bd ON r.id = bd.room_id
                JOIN tenants t ON bd.id = t.bed_id WHERE h.id = {hostelId};"""
        cursor.execute(query)
        results = cursor.fetchall()
        
        data = {}
        if len(results) > 0:
            block_details = []
            floor_details = []
            room_details = []
            bed_details = []
            
            for r in results:
                block_data = {"blockId": r['blockId'], "blockName": r['block_name'], "manager": r['manager']}
                block_details.append(block_data)
                
                floor_data = {"floorId": r['floorId'], "floorName": r['floor_name'], "floorIncharge": r['floorIncharge']}
                floor_details.append(floor_data)
                
                room_data = {"roomId": r['roomId'], "roomNumber": r['room_no']}
                room_details.append(room_data)
                
                bed_data = {"bedId": r['bedId'], "bedNumber": r['bed_no'], "status": r['status'],
                            "tenantName": r['tenant_name'], "phoneNumber": r['phone'],
                            "emergencyContact": r['emergency_phone'], "designation": r['designation'],
                            "address": r['address'], "fee": r['fee'], "joiningDate": r['joining_date']}
                bed_details.append(bed_data)

            block_details = list({item['blockId']: item for item in block_details}.values())
            floor_details = list({item['floorId']: item for item in floor_details}.values())
            room_details = list({item['roomId']: item for item in room_details}.values())
            bed_details = list({item['bedId']: item for item in bed_details}.values())

            data = {'hostelId': results[0]['hostelId'],
                    "hostelName": results[0]['hostel_name'],
                    "hostelLocation": results[0]['location_id'],
                    "blockDetails": block_details,
                    "floorDetails": floor_details,
                    "roomDetails": room_details,
                    "bedDetails": bed_details}
        return data
    except Exception as e:
        return {"error": str(e)}
    finally:
        cursor.close()
        conn.close()


# --- BLOCKS ---

@app.post("/addBlocks")
def create_block(block: Block):
    db = localhost()
    cursor = db.cursor()
    
    if block.hostel_id:
        cursor.execute("SELECT hostel_code FROM hostels WHERE id = ?", (block.hostel_id,))
        h_row = cursor.fetchone()
        if h_row and h_row.get('hostel_code'):
            prefix = h_row['hostel_code'] + '-'
            if not block.block_name.startswith(prefix):
                block.block_name = f"{h_row['hostel_code']}-{block.block_name}"

    query = "INSERT INTO blocks (hostel_id, block_name, manager_id, block_incharge_id) VALUES (?, ?, ?, ?)"
    values = (block.hostel_id, block.block_name, block.manager_id, block.block_incharge_id)
    cursor.execute(query, values)
    db.commit()
    db.close()
    return {"message": "Block created successfully"}

@app.get("/getBlocks")
def get_blocks():
    db = localhost()
    cursor = db.cursor()
    query = "SELECT * FROM blocks"
    cursor.execute(query)
    blocks = cursor.fetchall()
    db.close()
    return blocks

@app.get("/getBlockDetails/{id}")
def get_block(id: int):
    db = localhost()
    cursor = db.cursor()
    query = "SELECT * FROM blocks WHERE id = ?"
    cursor.execute(query, (id,))
    block = cursor.fetchone()
    db.close()
    if not block:
        raise HTTPException(status_code=404, detail="Block not found")
    return block

@app.put("/updateBlockDetails/{id}")
def update_block(id: int, block: Block):
    db = localhost()
    cursor = db.cursor()
    query = "UPDATE blocks SET hostel_id = ?, block_name = ?, manager_id = ?, block_incharge_id = ? WHERE id = ?"
    values = (block.hostel_id, block.block_name, block.manager_id, block.block_incharge_id, id)
    cursor.execute(query, values)
    db.commit()
    db.close()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Block not found")
    return {"message": "Block updated successfully"}

@app.delete("/deleteBlock/{id}")
def delete_block(id: int):
    db = localhost()
    cursor = db.cursor()
    query = "DELETE FROM blocks WHERE id = ?"
    cursor.execute(query, (id,))
    db.commit()
    db.close()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Block not found")
    return {"message": "Block deleted successfully"}


# --- FLOORS ---

@app.post("/addFloor")
def create_floor(floor: Floor):
    db = localhost()
    cursor = db.cursor()
    query = "INSERT INTO floors (block_id, floor_name, incharge_id) VALUES (?, ?, ?)"
    values = (floor.block_id, floor.floor_name, floor.incharge_id)
    cursor.execute(query, values)
    db.commit()
    db.close()
    return {"message": "Floor created successfully"}

@app.get("/getFloors")
def get_floors():
    db = localhost()
    cursor = db.cursor()
    query = "SELECT * FROM floors"
    cursor.execute(query)
    floors = cursor.fetchall()
    db.close()
    return floors

@app.get("/getFloorDetails/{id}")
def get_floor(id: int):
    db = localhost()
    cursor = db.cursor()
    query = "SELECT * FROM floors WHERE id = ?"
    cursor.execute(query, (id,))
    floor = cursor.fetchone()
    db.close()
    if not floor:
        raise HTTPException(status_code=404, detail="Floor not found")
    return floor

@app.put("/updateFloorDetails/{id}")
def update_floor(id: int, floor: Floor):
    db = localhost()
    cursor = db.cursor()
    query = "UPDATE floors SET block_id = ?, floor_name = ?, incharge_id = ? WHERE id = ?"
    values = (floor.block_id, floor.floor_name, floor.incharge_id, id)
    cursor.execute(query, values)
    db.commit()
    db.close()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Floor not found")
    return {"message": "Floor updated successfully"}

@app.delete("/deleteFloor/{id}")
def delete_floor(id: int):
    db = localhost()
    cursor = db.cursor()
    query = "DELETE FROM floors WHERE id = ?"
    cursor.execute(query, (id,))
    db.commit()
    db.close()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Floor not found")
    return {"message": "Floor deleted successfully"}


# --- ROOMS ---

@app.post("/addRoom")
def create_room(room: Room):
    db = localhost()
    cursor = db.cursor()
    query = "INSERT INTO rooms (floor_id, room_no) VALUES (?, ?)"
    values = (room.floor_id, room.room_no)
    cursor.execute(query, values)
    db.commit()
    db.close()
    return {"message": "Room created successfully"}

@app.get("/getRooms")
def get_rooms():
    db = localhost()
    cursor = db.cursor()
    query = "SELECT * FROM rooms"
    cursor.execute(query)
    rooms = cursor.fetchall()
    db.close()
    return rooms

@app.get("/getRoomDetails/{id}")
def get_room(id: int):
    db = localhost()
    cursor = db.cursor()
    query = "SELECT * FROM rooms WHERE id = ?"
    cursor.execute(query, (id,))
    room = cursor.fetchone()
    db.close()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room

@app.put("/updateRoomDetails/{id}")
def update_room(id: int, room: Room):
    db = localhost()
    cursor = db.cursor()
    query = "UPDATE rooms SET floor_id = ?, room_no = ? WHERE id = ?"
    values = (room.floor_id, room.room_no, id)
    cursor.execute(query, values)
    db.commit()
    db.close()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Room not found")
    return {"message": "Room updated successfully"}

@app.delete("/deleteRoom/{id}")
def delete_room(id: int):
    db = localhost()
    cursor = db.cursor()
    query = "DELETE FROM rooms WHERE id = ?"
    cursor.execute(query, (id,))
    db.commit()
    db.close()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Room not found")
    return {"message": "Room deleted successfully"}


# --- BEDS ---

@app.post("/addBed")
def create_bed(bed: Bed):
    db = localhost()
    cursor = db.cursor()
    query = "INSERT INTO beds (room_id, bed_no, status) VALUES (?, ?, ?)"
    values = (bed.room_id, bed.bed_no, bed.status)
    cursor.execute(query, values)
    db.commit()
    db.close()
    return {"message": "Bed created successfully"}

@app.get("/getBeds")
def get_beds():
    db = localhost()
    cursor = db.cursor()
    query = "SELECT * FROM beds"
    cursor.execute(query)
    beds = cursor.fetchall()
    db.close()
    return beds

@app.get("/getBedDetails/{id}")
def get_bed(id: int):
    db = localhost()
    cursor = db.cursor()
    query = "SELECT * FROM beds WHERE id = ?"
    cursor.execute(query, (id,))
    bed = cursor.fetchone()
    db.close()
    if not bed:
        raise HTTPException(status_code=404, detail="Bed not found")
    return bed

@app.put("/updateBedDetails/{id}")
def update_bed(id: int, bed: Bed):
    db = localhost()
    cursor = db.cursor()
    query = "UPDATE beds SET room_id = ?, bed_no = ?, status = ? WHERE id = ?"
    values = (bed.room_id, bed.bed_no, bed.status, id)
    cursor.execute(query, values)
    db.commit()
    db.close()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Bed not found")
    return {"message": "Bed updated successfully"}

@app.delete("/deleteBed/{id}")
def delete_bed(id: int):
    db = localhost()
    cursor = db.cursor()
    query = "DELETE FROM beds WHERE id = ?"
    cursor.execute(query, (id,))
    db.commit()
    db.close()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Bed not found")
    return {"message": "Bed deleted successfully"}


# --- TENANTS ---

@app.post("/addTenant")
def create_tenant(tenant: Tenant):
    db = localhost()
    cursor = db.cursor()
    query = """
    INSERT INTO tenants
    (tenant_name, phone, emergency_phone, designation, address, bed_id, fee, joining_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """
    values = (tenant.tenant_name, tenant.phone, tenant.emergency_phone, tenant.designation,
              tenant.address, tenant.bed_id, tenant.fee, tenant.joining_date)
    cursor.execute(query, values)
    db.commit()
    db.close()
    return {"message": "Tenant created successfully"}

@app.get("/getTenants")
def get_tenants():
    db = localhost()
    cursor = db.cursor()
    query = "SELECT * FROM tenants"
    cursor.execute(query)
    tenants = cursor.fetchall()
    db.close()
    return tenants

@app.get("/getTenantDetails/{id}")
def get_tenant(id: int):
    db = localhost()
    cursor = db.cursor()
    query = "SELECT * FROM tenants WHERE id = ?"
    cursor.execute(query, (id,))
    tenant = cursor.fetchone()
    db.close()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant

@app.put("/updateTenantDetails/{id}")
def update_tenant(id: int, tenant: Tenant):
    db = localhost()
    cursor = db.cursor()
    query = """
    UPDATE tenants
    SET tenant_name = ?, phone = ?, emergency_phone = ?, designation = ?,
        address = ?, bed_id = ?, fee = ?, joining_date = ?
    WHERE id = ?
    """
    values = (tenant.tenant_name, tenant.phone, tenant.emergency_phone, tenant.designation,
              tenant.address, tenant.bed_id, tenant.fee, tenant.joining_date, id)
    cursor.execute(query, values)
    db.commit()
    db.close()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return {"message": "Tenant updated successfully"}

@app.delete("/deleteTenant/{id}")
def delete_tenant(id: int):
    db = localhost()
    cursor = db.cursor()
    query = "DELETE FROM tenants WHERE id = ?"
    cursor.execute(query, (id,))
    db.commit()
    db.close()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return {"message": "Tenant deleted successfully"}


import os
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

# --- SERVE FRONTEND IN PRODUCTION ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST_DIR = os.path.join(BASE_DIR, "dist")
ASSETS_DIR = os.path.join(DIST_DIR, "assets")

if os.path.exists(ASSETS_DIR):
    app.mount("/assets", StaticFiles(directory=ASSETS_DIR), name="assets")

@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    # Try to serve requested static file (e.g. vite.svg)
    file_path = os.path.join(DIST_DIR, full_path)
    if os.path.isfile(file_path):
        return FileResponse(file_path)
    
    # Otherwise fallback to index.html for React Router
    index_path = os.path.join(DIST_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
        
    return {"message": "API is running. Frontend not built yet!"}

if __name__ == '__main__':
    import uvicorn
    port = int(os.environ.get("PORT", 3000))
    uvicorn.run("main:app", host='0.0.0.0', port=port, reload=False)
