import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/getFullHostelDetails_1_0': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
      '/login': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/addUser': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/getUsers': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/getRoles': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/usersList': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/updateUser': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/deactivateUser': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/hardDeleteUser': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/addHostel': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/getHostels': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/getHostelDetails': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/updateHostelDetails': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/updateHostelStatus': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/addBlocks': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/getBlocks': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/updateBlockDetails': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/deleteBlock': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/addFloor': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/getFloors': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/updateFloorDetails': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/deleteFloor': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/addRoom': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/getRooms': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/updateRoomDetails': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/deleteRoom': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/addBed': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/getBeds': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/updateBedDetails': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/deleteBed': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/addTenant': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/getTenants': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/updateTenantDetails': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/deleteTenant': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/upload': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/uploads': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/getAttendance': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/addAttendance': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/resetPassword': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/getBedHistory': { target: 'http://127.0.0.1:3000', changeOrigin: true }
    }
  }
})