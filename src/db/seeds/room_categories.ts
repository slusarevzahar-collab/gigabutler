import { db } from '@/db';
import { roomCategories } from '@/db/schema';

async function main() {
    const sampleRoomCategories = [
        {
            code: 'XJG',
            name: 'Suite Junior Garden',
            description: 'семейный номер с видом на парк',
            createdAt: new Date().toISOString(),
        },
        {
            code: 'DTG',
            name: 'Deluxe Twin Garden',
            description: 'двухместный номер с двумя раздельными кроватями с видом на парк',
            createdAt: new Date().toISOString(),
        },
        {
            code: 'DKG',
            name: 'Deluxe King Garden',
            description: 'двухместный номер с одной большой кроватью с видом на парк',
            createdAt: new Date().toISOString(),
        },
        {
            code: 'CDG',
            name: 'Connecting Deluxe Garden',
            description: 'соединенные делюкс номера с видом на парк',
            createdAt: new Date().toISOString(),
        },
        {
            code: 'DKS',
            name: 'Deluxe King Sea',
            description: 'двухместный номер с одной большой кроватью с видом на море',
            createdAt: new Date().toISOString(),
        },
        {
            code: 'XJS',
            name: 'Suite Junior Sea',
            description: 'семейный номер с видом на море',
            createdAt: new Date().toISOString(),
        },
        {
            code: 'DTS',
            name: 'Deluxe Twin Sea',
            description: 'двухместный номер с двумя раздельными кроватями с видом на море',
            createdAt: new Date().toISOString(),
        },
        {
            code: 'CDS',
            name: 'Connecting Deluxe Sea',
            description: 'соединенные делюкс номера с видом на море',
            createdAt: new Date().toISOString(),
        },
        {
            code: 'HCR',
            name: 'Handicapped Room',
            description: 'номер с двумя раздельными кроватями для людей с ограниченными возможностями',
            createdAt: new Date().toISOString(),
        },
        {
            code: 'SEG',
            name: 'Suite Elegant Garden',
            description: 'семейный люкс с видом на горы',
            createdAt: new Date().toISOString(),
        },
        {
            code: 'DCKG',
            name: 'Deluxe Comfort King Garden',
            description: 'двухместный номер с одной кроватью с видом на парк',
            createdAt: new Date().toISOString(),
        },
        {
            code: 'DCTG',
            name: 'Deluxe Comfort Twin Garden',
            description: 'двухместный номер с двумя раздельными кроватями с видом на парк',
            createdAt: new Date().toISOString(),
        },
        {
            code: 'DSKG',
            name: 'Deluxe Sharm King Garden',
            description: 'двухместный номер с одной кроватью с видом на парк',
            createdAt: new Date().toISOString(),
        },
        {
            code: 'DSSK',
            name: 'Deluxe Sharm King Sea',
            description: 'двухместный номер с одной кроватью с видом на море',
            createdAt: new Date().toISOString(),
        },
        {
            code: 'DCKS',
            name: 'Deluxe Comfort King Sea',
            description: 'двухместный номер с одной кроватью с видом на море',
            createdAt: new Date().toISOString(),
        },
        {
            code: 'SES',
            name: 'Suite Elegant Sea',
            description: 'семейный люкс с видом на море',
            createdAt: new Date().toISOString(),
        },
        {
            code: 'DCTS',
            name: 'Deluxe Comfort Twin Sea',
            description: 'двухместный номер с двумя одной кроватью с видом на море',
            createdAt: new Date().toISOString(),
        },
        {
            code: 'DPK',
            name: 'Deluxe Premier King',
            description: 'двухместный номер с одной кроватью без телевизора',
            createdAt: new Date().toISOString(),
        },
        {
            code: 'DSPKG',
            name: 'Deluxe Sharm Prime King Garden',
            description: 'двухместный номер с одной кроватью с видом на парк',
            createdAt: new Date().toISOString(),
        },
        {
            code: 'DSPKS',
            name: 'Deluxe Sharm Prime King Sea',
            description: 'двухместный номер с одной кроватью с видом на парк',
            createdAt: new Date().toISOString(),
        },
        {
            code: 'XRS',
            name: 'Suite Royal Sea',
            description: 'королевский номер с двумя спальнями и гостиной с видом на море',
            createdAt: new Date().toISOString(),
        },
        {
            code: 'VEG',
            name: 'Villa Executive Garden',
            description: 'семейная вилла c видом на парк',
            createdAt: new Date().toISOString(),
        },
        {
            code: 'FWVHC',
            name: 'Family Wine Villa Handicapped',
            description: 'семейная винная вилла для людей с ограниченными возможностями',
            createdAt: new Date().toISOString(),
        },
        {
            code: 'FWV',
            name: 'Family Wine Villa',
            description: 'семейная винная вилла',
            createdAt: new Date().toISOString(),
        },
        {
            code: 'VPS',
            name: 'Villa Presidential Sea',
            description: 'президентская вилла с видом на море',
            createdAt: new Date().toISOString(),
        },
        {
            code: 'VIG',
            name: 'Villa Imperial Garden',
            description: 'императорская вилла с видом на парк',
            createdAt: new Date().toISOString(),
        },
        {
            code: 'PWV',
            name: 'Presidential Wine Villa',
            description: 'президентская винная вилла',
            createdAt: new Date().toISOString(),
        },
        {
            code: 'SMS',
            name: 'SPA Medical Suite',
            description: 'СПА апартаменты в MLI',
            createdAt: new Date().toISOString(),
        },
        {
            code: 'JSG',
            name: 'Japanese Suite Garden',
            description: 'японский сюит с видом на парк',
            createdAt: new Date().toISOString(),
        },
        {
            code: 'SRSH',
            name: 'Penthouse',
            description: 'королевский номер с двумя спальнями и гостиной с видом на море на 6 этаже',
            createdAt: new Date().toISOString(),
        },
    ];

    await db.insert(roomCategories).values(sampleRoomCategories);
    
    console.log('✅ Room categories seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});