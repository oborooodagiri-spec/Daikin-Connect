const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetFaceData() {
    try {
        console.log('Resetting face data for all users...');
        const result = await prisma.users.updateMany({
            data: {
                face_reference_url: null,
                face_verification_enabled: true // Keep it true so it enrolls on first use
            }
        });
        console.log(`Successfully reset face data for ${result.count} users.`);
    } catch (error) {
        console.error('Error resetting face data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetFaceData();
