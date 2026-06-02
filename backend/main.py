from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.staticfiles import StaticFiles
import os
import shutil
import uuid
import cloudinary
import cloudinary.uploader
import cloudinary.api
from dotenv import load_dotenv
from application_properties import localhost, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

load_dotenv()

# Configure Cloudinary
cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET
)

from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date

app = FastAPI()

app.add_middleware(CORSMiddleware,
                   allow_origins=["*"],
                   allow_credentials=True,
                   allow_methods=["*"],
                   allow_headers=["*"])


# --- Pydantic Models ---

class User(BaseModel):
    photo_url: str | None = None
    user_name: str
    contact_no: str | None = None
    address: str | None = None
    role_id: int | None = None
    manager_id: int | None = None
    email_id: EmailStr
    password: str | None = "123456"
    status: str | None = "T"

class Login(BaseModel):
    email_id: EmailStr
    password: str

class ResetPasswordRequest(BaseModel):
    email_id: EmailStr
    new_password: str

class Hostel(BaseModel):
    photo_url: str | None = None
    hostel_name: str | None = None
    hostel_code: str | None = None
    location_id: int | None = None
    manager_id: int | None = None
    status: str | None = None

class Block(BaseModel):
    photo_url: str | None = None
    hostel_id: int | None = None
    block_name: str
    block_incharge_id: int | None = None

class Floor(BaseModel):
    photo_url: str | None = None
    block_id: int
    floor_name: str
    incharge_id: int | None = None

class Room(BaseModel):
    photo_url: str | None = None
    floor_id: int
    room_no: str

def log_bed_history(cursor, bed_id: int, tenant_id: int | None, action: str, notes: str | None = None):
    cursor.execute(
        "INSERT INTO bed_history (bed_id, tenant_id, action, notes) VALUES (%s, %s, %s, %s)",
        (bed_id, tenant_id, action, notes)
    )

class Bed(BaseModel):
    photo_url: str | None = None
    room_id: int
    bed_no: str
    status: Optional[str] = "Vacant"

class Tenant(BaseModel):
    photo_url: str | None = None
    tenant_name: str
    phone: Optional[str] = None
    emergency_phone: Optional[str] = None
    designation: Optional[str] = None
    address: Optional[str] = None
    bed_id: Optional[int] = None
    fee: Optional[float] = None
    joining_date: Optional[date] = None

class Attendance(BaseModel):
    tenant_id: int
    attendance_date: date
    status: str
    notes: Optional[str] = None



# --- UPLOADS ---
os.makedirs('uploads', exist_ok=True)
app.mount('/uploads', StaticFiles(directory='uploads'), name='uploads')

@app.post('/upload')
async def upload_file(file: UploadFile = File(...)):
    if CLOUDINARY_CLOUD_NAME:
        try:
            contents = await file.read()
            result = cloudinary.uploader.upload(contents)
            return {'photo_url': result['secure_url']}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Cloudinary upload failed: {str(e)}")
    else:
        ext = file.filename.split('.')[-1]
        filename = f'{uuid.uuid4()}.{ext}'
        path = os.path.join('uploads', filename)
        with open(path, 'wb') as buffer:
            shutil.copyfileobj(file.file, buffer)
        return {'photo_url': f'/uploads/{filename}'}

# --- USERS ---


@app.post("/login")
def login_user(login: Login):
    db = localhost()
    cursor = db.cursor()
    query = """
    SELECT user_id, user_name, email_id, role_id, status
    FROM users
    WHERE email_id = %s AND password = %s AND status = 'T'
    """
    cursor.execute(query, (login.email_id, login.password))
    user = cursor.fetchone()
    cursor.close()
    db.close()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"message": "Login successful", "user": user}

@app.post("/resetPassword")
def reset_password(data: ResetPasswordRequest):
    db = localhost()
    cursor = db.cursor()
    
    cursor.execute("SELECT * FROM users WHERE email_id = %s", (data.email_id,))
    user = cursor.fetchone()
    
    if not user:
        db.close()
        raise HTTPException(status_code=404, detail="Email address not found")
        
    cursor.execute("UPDATE users SET password = %s WHERE email_id = %s", (data.new_password, data.email_id))
    db.commit()
    db.close()
    
    return {"message": "Password reset successfully"}

@app.post("/addUser")
def create_user(user: User):
    db = localhost()
    cursor = db.cursor()
    default_password = 123456
    query = """
    INSERT INTO users (user_name, contact_no, address, role_id, manager_id, email_id, password, status, photo_url)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    values = (user.user_name, user.contact_no, user.address, user.role_id, user.manager_id, user.email_id, default_password, user.status, user.photo_url)
    cursor.execute(query, values)
    db.commit()
    db.close()
    return {"message": "User created successfully"}

@app.get("/getUsers")
def get_users():
    db = localhost()
    cursor = db.cursor()
    query = """SELECT u.user_id, u.user_name, u.contact_no, u.address, u.email_id, u.role_id, r.role_name, u.manager_id, u.status, u.photo_url 
               FROM users u JOIN roles r ON r.id = u.role_id"""
    cursor.execute(query)
    users = cursor.fetchall()
    db.close()
    return users

@app.get("/getUserDetails/{user_id}")
def get_user(user_id: int):
    db = localhost()
    cursor = db.cursor()
    query = """SELECT u.user_id, u.user_name, u.contact_no, u.address, u.email_id, u.role_id, r.role_name, u.manager_id, u.status, u.photo_url 
               FROM users u JOIN roles r ON r.id = u.role_id WHERE user_id = %s"""
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
    query = """UPDATE users SET user_name = %s, contact_no = %s, address = %s, role_id = %s, manager_id = %s, email_id = %s, status = %s, photo_url = %s WHERE user_id = %s"""
    values = (user.user_name, user.contact_no, user.address, user.role_id, user.manager_id, user.email_id, user.status, user.photo_url, user_id)
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
    query = "update users set status = 'F' WHERE user_id = %s"
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
        
    query = "INSERT INTO hostels (hostel_name, hostel_code, location_id, manager_id, status, photo_url) VALUES (%s, %s, %s, %s, %s, %s)"
    values = (hostel.hostel_name, h_code, hostel.location_id, hostel.manager_id, 'T', hostel.photo_url)
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
    query = "SELECT * FROM hostels WHERE id = %s"
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
        
    query = "UPDATE hostels SET hostel_name = %s, hostel_code = %s, location_id = %s, manager_id = %s, status = %s, photo_url = %s WHERE id = %s"
    values = (hostel.hostel_name, h_code, hostel.location_id, hostel.manager_id, hostel.status, hostel.photo_url, id)
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
    query = "update hostels set status = 'F' WHERE id = %s"
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
        query = f"""SELECT h.id AS hostelId, h.hostel_name, h.location_id, u0.user_name AS manager,
                b.id as blockId, b.block_name, 
                f.id as floorId, f.floor_name, u2.user_name AS floorIncharge, r.id as roomId, r.room_no, bd.id as bedId, 
                bd.bed_no, bd.status, 
                t.tenant_name, t.phone, t.emergency_phone, t.designation, t.address, t.fee, t.joining_date FROM hostels h
                JOIN blocks b ON h.id = b.hostel_id
                LEFT JOIN users u1 ON u1.user_id = b.block_incharge_id
                JOIN floors f ON b.id = f.block_id
                LEFT JOIN users u2 ON u2.user_id = f.incharge_id
                JOIN rooms r ON f.id = r.floor_id
                JOIN beds bd ON r.id = bd.room_id
                JOIN tenants t ON bd.id = t.bed_id 
                LEFT JOIN users u0 ON h.manager_id = u0.user_id
                WHERE h.id = {hostelId};"""
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
        cursor.execute("SELECT hostel_code FROM hostels WHERE id = %s", (block.hostel_id,))
        h_row = cursor.fetchone()
        if h_row and h_row.get('hostel_code'):
            prefix = h_row['hostel_code'] + '-'
            if not block.block_name.startswith(prefix):
                block.block_name = f"{h_row['hostel_code']}-{block.block_name}"

    query = "INSERT INTO blocks (hostel_id, block_name, block_incharge_id, photo_url) VALUES (%s, %s, %s, %s)"
    values = (block.hostel_id, block.block_name, block.block_incharge_id, block.photo_url)
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
    query = "SELECT * FROM blocks WHERE id = %s"
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
    query = "UPDATE blocks SET hostel_id = %s, block_name = %s, block_incharge_id = %s, photo_url = %s WHERE id = %s"
    values = (block.hostel_id, block.block_name, block.block_incharge_id, block.photo_url, id)
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
    query = "DELETE FROM blocks WHERE id = %s"
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
    query = "INSERT INTO floors (block_id, floor_name, incharge_id, photo_url) VALUES (%s, %s, %s, %s)"
    values = (floor.block_id, floor.floor_name, floor.incharge_id, floor.photo_url)
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
    query = "SELECT * FROM floors WHERE id = %s"
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
    query = "UPDATE floors SET block_id = %s, floor_name = %s, incharge_id = %s, photo_url = %s WHERE id = %s"
    values = (floor.block_id, floor.floor_name, floor.incharge_id, floor.photo_url, id)
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
    query = "DELETE FROM floors WHERE id = %s"
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
    query = "INSERT INTO rooms (floor_id, room_no, photo_url) VALUES (%s, %s, %s)"
    values = (room.floor_id, room.room_no, room.photo_url)
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
    query = "SELECT * FROM rooms WHERE id = %s"
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
    query = "UPDATE rooms SET floor_id = %s, room_no = %s, photo_url = %s WHERE id = %s"
    values = (room.floor_id, room.room_no, room.photo_url, id)
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
    query = "DELETE FROM rooms WHERE id = %s"
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
    status = 'Vacant' # Force default to vacant on creation
    query = "INSERT INTO beds (room_id, bed_no, status, photo_url) VALUES (%s, %s, %s, %s) RETURNING id"
    values = (bed.room_id, bed.bed_no, status, bed.photo_url)
    cursor.execute(query, values)
    new_bed_id = cursor.fetchone()['id']
    
    log_bed_history(cursor, new_bed_id, None, "Created", f"Bed {bed.bed_no} added to room {bed.room_id}")

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
    query = "SELECT * FROM beds WHERE id = %s"
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
    query = "UPDATE beds SET room_id = %s, bed_no = %s, status = %s, photo_url = %s WHERE id = %s"
    values = (bed.room_id, bed.bed_no, bed.status, bed.photo_url, id)
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
    query = "DELETE FROM beds WHERE id = %s"
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
    (tenant_name, phone, emergency_phone, designation, address, bed_id, fee, joining_date, photo_url)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id
    """
    values = (tenant.tenant_name, tenant.phone, tenant.emergency_phone, tenant.designation,
              tenant.address, tenant.bed_id, tenant.fee, tenant.joining_date, tenant.photo_url)
    cursor.execute(query, values)
    new_tenant_id = cursor.fetchone()['id']
    
    if tenant.bed_id:
        cursor.execute("UPDATE beds SET status = 'Occupied' WHERE id = %s", (tenant.bed_id,))
        log_bed_history(cursor, tenant.bed_id, new_tenant_id, "Assigned", f"Assigned to {tenant.tenant_name}")
        
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
    query = "SELECT * FROM tenants WHERE id = %s"
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
    
    cursor.execute("SELECT bed_id FROM tenants WHERE id = %s", (id,))
    old_tenant = cursor.fetchone()
    old_bed_id = old_tenant['bed_id'] if old_tenant else None

    query = """
    UPDATE tenants
    SET tenant_name = %s, phone = %s, emergency_phone = %s, designation = %s,
        address = %s, bed_id = %s, fee = %s, joining_date = %s, photo_url = %s
    WHERE id = %s
    """
    values = (tenant.tenant_name, tenant.phone, tenant.emergency_phone, tenant.designation,
              tenant.address, tenant.bed_id, tenant.fee, tenant.joining_date, tenant.photo_url, id)
    cursor.execute(query, values)
    
    if cursor.rowcount == 0:
        db.close()
        raise HTTPException(status_code=404, detail="Tenant not found")
        
    if old_bed_id and old_bed_id != tenant.bed_id:
        cursor.execute("UPDATE beds SET status = 'Vacant' WHERE id = %s", (old_bed_id,))
        log_bed_history(cursor, old_bed_id, id, "Vacated", f"Vacated by {tenant.tenant_name} (transferred)")
    if tenant.bed_id and old_bed_id != tenant.bed_id:
        cursor.execute("UPDATE beds SET status = 'Occupied' WHERE id = %s", (tenant.bed_id,))
        log_bed_history(cursor, tenant.bed_id, id, "Assigned", f"Assigned to {tenant.tenant_name}")

    db.commit()
    db.close()
    return {"message": "Tenant updated successfully"}

@app.delete("/deleteTenant/{id}")
def delete_tenant(id: int):
    db = localhost()
    cursor = db.cursor()
    
    cursor.execute("SELECT bed_id FROM tenants WHERE id = %s", (id,))
    old_tenant = cursor.fetchone()
    
    query = "DELETE FROM tenants WHERE id = %s"
    cursor.execute(query, (id,))
    
    if cursor.rowcount == 0:
        db.close()
        raise HTTPException(status_code=404, detail="Tenant not found")
        
    if old_tenant and old_tenant['bed_id']:
        cursor.execute("UPDATE beds SET status = 'Vacant' WHERE id = %s", (old_tenant['bed_id'],))
        log_bed_history(cursor, old_tenant['bed_id'], id, "Vacated", f"Tenant deleted")
        
    db.commit()
    db.close()
    return {"message": "Tenant deleted successfully"}

@app.get("/getBedHistory/{bed_id}")
def get_bed_history(bed_id: int):
    db = localhost()
    cursor = db.cursor()
    query = "SELECT h.*, t.tenant_name FROM bed_history h LEFT JOIN tenants t ON h.tenant_id = t.id WHERE h.bed_id = %s ORDER BY h.created_at DESC"
    cursor.execute(query, (bed_id,))
    history = cursor.fetchall()
    db.close()
    return history

# --- ATTENDANCE ---

@app.post("/addAttendance")
def mark_attendance(attendance: Attendance):
    db = localhost()
    cursor = db.cursor()
    
    query = """
    INSERT INTO attendance (tenant_id, attendance_date, status, notes)
    VALUES (%s, %s, %s, %s)
    ON CONFLICT (tenant_id, attendance_date) 
    DO UPDATE SET status = EXCLUDED.status, notes = EXCLUDED.notes
    """
    values = (attendance.tenant_id, attendance.attendance_date, attendance.status, attendance.notes)
    
    cursor.execute(query, values)
    db.commit()
    db.close()
    return {"message": "Attendance marked successfully"}

@app.get("/getAttendance")
def get_attendance(target_date: Optional[date] = None):
    db = localhost()
    cursor = db.cursor()
    if target_date:
        query = "SELECT * FROM attendance WHERE attendance_date = %s"
        cursor.execute(query, (target_date,))
    else:
        query = "SELECT * FROM attendance"
        cursor.execute(query)
    records = cursor.fetchall()
    db.close()
    return records

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
