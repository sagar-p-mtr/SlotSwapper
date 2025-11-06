import { PrismaClient, EventStatus, SwapRequestStatus } from '@prisma/client';

const prisma = new PrismaClient();

describe('Swap Logic Tests', () => {
  let user1Id: string;
  let user2Id: string;
  let event1Id: string;
  let event2Id: string;

  beforeAll(async () => {
    // Create test users
    const user1 = await prisma.user.create({
      data: {
        email: 'user1@test.com',
        name: 'User One',
        password: 'hashedpassword1'
      }
    });
    user1Id = user1.id;

    const user2 = await prisma.user.create({
      data: {
        email: 'user2@test.com',
        name: 'User Two',
        password: 'hashedpassword2'
      }
    });
    user2Id = user2.id;

    // Create test events
    const event1 = await prisma.event.create({
      data: {
        title: 'User 1 Event',
        startTime: new Date('2025-11-10T10:00:00Z'),
        endTime: new Date('2025-11-10T11:00:00Z'),
        status: EventStatus.SWAPPABLE,
        userId: user1Id
      }
    });
    event1Id = event1.id;

    const event2 = await prisma.event.create({
      data: {
        title: 'User 2 Event',
        startTime: new Date('2025-11-12T14:00:00Z'),
        endTime: new Date('2025-11-12T15:00:00Z'),
        status: EventStatus.SWAPPABLE,
        userId: user2Id
      }
    });
    event2Id = event2.id;
  });

  afterAll(async () => {
    // Clean up
    await prisma.swapRequest.deleteMany({});
    await prisma.event.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  test('should create a swap request and set slots to SWAP_PENDING', async () => {
    const swapRequest = await prisma.$transaction(async (tx) => {
      // Update both slots to SWAP_PENDING
      await Promise.all([
        tx.event.update({
          where: { id: event1Id },
          data: { status: EventStatus.SWAP_PENDING }
        }),
        tx.event.update({
          where: { id: event2Id },
          data: { status: EventStatus.SWAP_PENDING }
        })
      ]);

      // Create swap request
      return await tx.swapRequest.create({
        data: {
          initiatorId: user1Id,
          receiverId: user2Id,
          initiatorSlotId: event1Id,
          receiverSlotId: event2Id,
          status: SwapRequestStatus.PENDING
        }
      });
    });

    expect(swapRequest.status).toBe(SwapRequestStatus.PENDING);

    const [slot1, slot2] = await Promise.all([
      prisma.event.findUnique({ where: { id: event1Id } }),
      prisma.event.findUnique({ where: { id: event2Id } })
    ]);

    expect(slot1?.status).toBe(EventStatus.SWAP_PENDING);
    expect(slot2?.status).toBe(EventStatus.SWAP_PENDING);
  });

  test('should accept swap and exchange ownership', async () => {
    const swapRequest = await prisma.swapRequest.findFirst({
      where: {
        initiatorSlotId: event1Id,
        receiverSlotId: event2Id
      }
    });

    expect(swapRequest).not.toBeNull();

    await prisma.$transaction(async (tx) => {
      // Update swap request status
      await tx.swapRequest.update({
        where: { id: swapRequest!.id },
        data: { status: SwapRequestStatus.ACCEPTED }
      });

      // Exchange ownership
      await Promise.all([
        tx.event.update({
          where: { id: event1Id },
          data: { userId: user2Id, status: EventStatus.BUSY }
        }),
        tx.event.update({
          where: { id: event2Id },
          data: { userId: user1Id, status: EventStatus.BUSY }
        })
      ]);
    });

    const [slot1, slot2, updatedRequest] = await Promise.all([
      prisma.event.findUnique({ where: { id: event1Id } }),
      prisma.event.findUnique({ where: { id: event2Id } }),
      prisma.swapRequest.findUnique({ where: { id: swapRequest!.id } })
    ]);

    expect(slot1?.userId).toBe(user2Id);
    expect(slot1?.status).toBe(EventStatus.BUSY);
    expect(slot2?.userId).toBe(user1Id);
    expect(slot2?.status).toBe(EventStatus.BUSY);
    expect(updatedRequest?.status).toBe(SwapRequestStatus.ACCEPTED);
  });
});
