const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function resetAutoIncrement() {
  try {
    // Delete all applications (optional - remove if you want to keep data)
    // await prisma.application.deleteMany({})
    
    // Reset the SQLite auto-increment counter
    await prisma.$executeRawUnsafe(`DELETE FROM sqlite_sequence WHERE name='Application'`)
    
    console.log('✅ Auto-increment counter has been reset for Application table')
    console.log('The next application will start from ID 1')
  } catch (error) {
    console.error('Error resetting auto-increment:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetAutoIncrement()
