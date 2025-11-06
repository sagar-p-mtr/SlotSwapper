import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient, EventStatus } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticate);

// Validation middleware
const validateEvent = [
  body('title').trim().notEmpty().isLength({ min: 1, max: 200 }),
  body('startTime').isISO8601(),
  body('endTime').isISO8601()
];

// GET /api/events - Get all events for the authenticated user
router.get('/', async (req: AuthRequest, res: Response, next) => {
  try {
    const events = await prisma.event.findMany({
      where: { userId: req.userId },
      orderBy: { startTime: 'asc' }
    });

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/events/:id - Get a specific event
router.get('/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id }
    });

    if (!event) {
      throw createError('Event not found', 404);
    }

    if (event.userId !== req.userId) {
      throw createError('Unauthorized access to this event', 403);
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/events - Create a new event
router.post('/', validateEvent, async (req: AuthRequest, res: Response, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, startTime, endTime } = req.body;

    // Validate time range
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      throw createError('End time must be after start time', 400);
    }

    const event = await prisma.event.create({
      data: {
        title,
        startTime: start,
        endTime: end,
        userId: req.userId!,
        status: EventStatus.BUSY
      }
    });

    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/events/:id - Update an event
router.patch('/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const { title, startTime, endTime, status } = req.body;

    // Find the event
    const event = await prisma.event.findUnique({
      where: { id }
    });

    if (!event) {
      throw createError('Event not found', 404);
    }

    if (event.userId !== req.userId) {
      throw createError('Unauthorized access to this event', 403);
    }

    // Validate status transitions
    if (status && status === EventStatus.SWAP_PENDING) {
      throw createError('Cannot manually set status to SWAP_PENDING', 400);
    }

    // Build update data
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (status !== undefined) updateData.status = status;

    if (startTime || endTime) {
      const start = startTime ? new Date(startTime) : event.startTime;
      const end = endTime ? new Date(endTime) : event.endTime;

      if (end <= start) {
        throw createError('End time must be after start time', 400);
      }

      updateData.startTime = start;
      updateData.endTime = end;
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      data: updatedEvent
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/events/:id - Delete an event
router.delete('/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id }
    });

    if (!event) {
      throw createError('Event not found', 404);
    }

    if (event.userId !== req.userId) {
      throw createError('Unauthorized access to this event', 403);
    }

    if (event.status === EventStatus.SWAP_PENDING) {
      throw createError('Cannot delete an event with pending swap', 400);
    }

    await prisma.event.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
