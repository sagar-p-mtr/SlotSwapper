import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient, EventStatus, SwapRequestStatus } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticate);

// GET /api/swappable-slots - Get all swappable slots from other users
router.get('/swappable-slots', async (req: AuthRequest, res: Response, next) => {
  try {
    const swappableSlots = await prisma.event.findMany({
      where: {
        status: EventStatus.SWAPPABLE,
        userId: { not: req.userId } // Exclude current user's slots
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { startTime: 'asc' }
    });

    res.json({
      success: true,
      data: swappableSlots
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/swap-requests - Get all swap requests (incoming and outgoing)
router.get('/swap-requests', async (req: AuthRequest, res: Response, next) => {
  try {
    // Incoming requests (where user is the receiver)
    const incomingRequests = await prisma.swapRequest.findMany({
      where: {
        receiverId: req.userId,
        status: SwapRequestStatus.PENDING
      },
      include: {
        initiator: {
          select: { id: true, name: true, email: true }
        },
        initiatorSlot: true,
        receiverSlot: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Outgoing requests (where user is the initiator)
    const outgoingRequests = await prisma.swapRequest.findMany({
      where: {
        initiatorId: req.userId
      },
      include: {
        receiver: {
          select: { id: true, name: true, email: true }
        },
        initiatorSlot: true,
        receiverSlot: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: {
        incoming: incomingRequests,
        outgoing: outgoingRequests
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/swap-request - Create a swap request
const validateSwapRequest = [
  body('mySlotId').isUUID(),
  body('theirSlotId').isUUID()
];

router.post('/swap-request', validateSwapRequest, async (req: AuthRequest, res: Response, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { mySlotId, theirSlotId } = req.body;

    // Verify both slots exist and are SWAPPABLE
    const [mySlot, theirSlot] = await Promise.all([
      prisma.event.findUnique({ where: { id: mySlotId } }),
      prisma.event.findUnique({ where: { id: theirSlotId } })
    ]);

    // Validate my slot
    if (!mySlot) {
      throw createError('Your slot not found', 404);
    }

    if (mySlot.userId !== req.userId) {
      throw createError('You do not own this slot', 403);
    }

    if (mySlot.status !== EventStatus.SWAPPABLE) {
      throw createError('Your slot must be SWAPPABLE to create a swap request', 400);
    }

    // Validate their slot
    if (!theirSlot) {
      throw createError('The requested slot not found', 404);
    }

    if (theirSlot.userId === req.userId) {
      throw createError('Cannot swap with your own slot', 400);
    }

    if (theirSlot.status !== EventStatus.SWAPPABLE) {
      throw createError('The requested slot is not available for swapping', 400);
    }

    // Check for existing pending swap requests involving these slots
    const existingRequest = await prisma.swapRequest.findFirst({
      where: {
        OR: [
          { initiatorSlotId: mySlotId, status: SwapRequestStatus.PENDING },
          { receiverSlotId: mySlotId, status: SwapRequestStatus.PENDING },
          { initiatorSlotId: theirSlotId, status: SwapRequestStatus.PENDING },
          { receiverSlotId: theirSlotId, status: SwapRequestStatus.PENDING }
        ]
      }
    });

    if (existingRequest) {
      throw createError('One of these slots already has a pending swap request', 400);
    }

    // Create swap request and update slot statuses in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update both slots to SWAP_PENDING
      await Promise.all([
        tx.event.update({
          where: { id: mySlotId },
          data: { status: EventStatus.SWAP_PENDING }
        }),
        tx.event.update({
          where: { id: theirSlotId },
          data: { status: EventStatus.SWAP_PENDING }
        })
      ]);

      // Create the swap request
      const swapRequest = await tx.swapRequest.create({
        data: {
          initiatorId: req.userId!,
          receiverId: theirSlot.userId,
          initiatorSlotId: mySlotId,
          receiverSlotId: theirSlotId,
          status: SwapRequestStatus.PENDING
        },
        include: {
          initiator: {
            select: { id: true, name: true, email: true }
          },
          receiver: {
            select: { id: true, name: true, email: true }
          },
          initiatorSlot: true,
          receiverSlot: true
        }
      });

      return swapRequest;
    });

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/swap-response/:requestId - Accept or reject a swap request
router.post('/swap-response/:requestId', async (req: AuthRequest, res: Response, next) => {
  try {
    const { requestId } = req.params;
    const { accept } = req.body;

    if (typeof accept !== 'boolean') {
      throw createError('Accept field must be a boolean', 400);
    }

    // Find the swap request
    const swapRequest = await prisma.swapRequest.findUnique({
      where: { id: requestId },
      include: {
        initiatorSlot: true,
        receiverSlot: true
      }
    });

    if (!swapRequest) {
      throw createError('Swap request not found', 404);
    }

    // Verify the current user is the receiver
    if (swapRequest.receiverId !== req.userId) {
      throw createError('You are not authorized to respond to this swap request', 403);
    }

    // Verify the request is still pending
    if (swapRequest.status !== SwapRequestStatus.PENDING) {
      throw createError('This swap request has already been processed', 400);
    }

    if (accept) {
      // ACCEPT: Exchange slot ownership and mark both as BUSY
      const result = await prisma.$transaction(async (tx) => {
        // Update swap request status
        await tx.swapRequest.update({
          where: { id: requestId },
          data: { status: SwapRequestStatus.ACCEPTED }
        });

        // Exchange ownership - swap the userIds
        await Promise.all([
          tx.event.update({
            where: { id: swapRequest.initiatorSlotId },
            data: {
              userId: swapRequest.receiverId,
              status: EventStatus.BUSY
            }
          }),
          tx.event.update({
            where: { id: swapRequest.receiverSlotId },
            data: {
              userId: swapRequest.initiatorId,
              status: EventStatus.BUSY
            }
          })
        ]);

        // Fetch updated swap request with all details
        return await tx.swapRequest.findUnique({
          where: { id: requestId },
          include: {
            initiator: { select: { id: true, name: true, email: true } },
            receiver: { select: { id: true, name: true, email: true } },
            initiatorSlot: true,
            receiverSlot: true
          }
        });
      });

      res.json({
        success: true,
        message: 'Swap accepted successfully',
        data: result
      });
    } else {
      // REJECT: Set request to REJECTED and revert slots to SWAPPABLE
      const result = await prisma.$transaction(async (tx) => {
        // Update swap request status
        await tx.swapRequest.update({
          where: { id: requestId },
          data: { status: SwapRequestStatus.REJECTED }
        });

        // Revert both slots to SWAPPABLE
        await Promise.all([
          tx.event.update({
            where: { id: swapRequest.initiatorSlotId },
            data: { status: EventStatus.SWAPPABLE }
          }),
          tx.event.update({
            where: { id: swapRequest.receiverSlotId },
            data: { status: EventStatus.SWAPPABLE }
          })
        ]);

        // Fetch updated swap request with all details
        return await tx.swapRequest.findUnique({
          where: { id: requestId },
          include: {
            initiator: { select: { id: true, name: true, email: true } },
            receiver: { select: { id: true, name: true, email: true } },
            initiatorSlot: true,
            receiverSlot: true
          }
        });
      });

      res.json({
        success: true,
        message: 'Swap rejected successfully',
        data: result
      });
    }
  } catch (error) {
    next(error);
  }
});

export default router;
