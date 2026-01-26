import express, { Request, Response } from 'express';
import Reservation from '../models/Reservation';
import Customer from '../models/Customer';
import { protect } from '../middleware/auth';
import { AuthRequest } from '../types';
import {
    validateReservationCreate,
    validateReservationUpdate,
    validateIdParam,
    validateReservationStatus,
    validateAvailableSlotsQuery,
    validateReservationFilters
} from '../middleware/validation';

const router = express.Router();

// @route   GET /api/reservations/check/available-slots
// @desc    Check available time slots for a date
// @access  Public
// IMPORTANT: This route MUST come BEFORE /:id to avoid route conflict
router.get('/check/available-slots', validateAvailableSlotsQuery, async (req: Request, res: Response) => {
    try {
        const { date } = req.query;

        const reservationDate = new Date(date as string);
        const nextDay = new Date(reservationDate);
        nextDay.setDate(nextDay.getDate() + 1);

        // Get all booked times for the date
        const bookedReservations = await Reservation.find({
            date: { $gte: reservationDate, $lt: nextDay },
            status: { $in: ['pending', 'confirmed'] },
        }).select('time');

        const bookedTimes = bookedReservations.map((r) => r.time);

        // Generate all possible time slots (9 AM to 10 PM, every 30 minutes)
        const allSlots = [];
        for (let hour = 9; hour <= 22; hour++) {
            for (let minute of [0, 30]) {
                if (hour === 22 && minute === 30) break; // Don't go past 10 PM
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                allSlots.push({
                    time: timeString,
                    available: !bookedTimes.includes(timeString),
                });
            }
        }

        res.json({
            success: true,
            data: {
                date: reservationDate,
                slots: allSlots,
            },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// @route   GET /api/reservations/stats
// @desc    Get reservation statistics
// @access  Private
router.get('/stats', protect, async (_req: AuthRequest, res: Response) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const totalReservations = await Reservation.countDocuments();
        const todayReservations = await Reservation.countDocuments({
            date: { $gte: today, $lt: tomorrow },
        });
        const pendingReservations = await Reservation.countDocuments({
            status: 'pending',
        });
        const confirmedReservations = await Reservation.countDocuments({
            status: 'confirmed',
        });

        // Upcoming reservations (next 7 days)
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        const upcomingReservations = await Reservation.find({
            date: { $gte: today, $lte: nextWeek },
            status: { $in: ['pending', 'confirmed'] },
        })
            .sort({ date: 1, time: 1 })
            .limit(10)
            .populate('customer', 'name phone');

        res.json({
            success: true,
            data: {
                total: totalReservations,
                today: todayReservations,
                pending: pendingReservations,
                confirmed: confirmedReservations,
                upcoming: upcomingReservations,
            },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// @route   GET /api/reservations
// @desc    Get all reservations (Admin only)
// @access  Private
router.get('/', protect, validateReservationFilters, async (req: AuthRequest, res: Response) => {
    try {
        const { status, date, startDate, endDate } = req.query;

        let query: any = {};

        // Filter by status (already validated)
        if (status) query.status = status;

        // Filter by specific date (already validated)
        if (date) {
            const searchDate = new Date(date as string);
            const nextDay = new Date(searchDate);
            nextDay.setDate(nextDay.getDate() + 1);

            query.date = {
                $gte: searchDate,
                $lt: nextDay,
            };
        }

        // Filter by date range (already validated)
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate as string);
            if (endDate) query.date.$lte = new Date(endDate as string);
        }

        const reservations = await Reservation.find(query)
            .populate('customer', 'name email phone')
            .sort({ date: 1, time: 1 });

        res.json({
            success: true,
            count: reservations.length,
            data: reservations,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// @route   GET /api/reservations/:id
// @desc    Get single reservation
// @access  Private
router.get('/:id', protect, validateIdParam, async (req: AuthRequest, res: Response) => {
    try {
        const reservation = await Reservation.findById(req.params.id).populate(
            'customer',
            'name email phone address'
        );

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservation not found',
            });
        }

        res.json({
            success: true,
            data: reservation,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// @route   POST /api/reservations
// @desc    Create new reservation (Public - from frontend)
// @access  Public
router.post('/', validateReservationCreate, async (req: Request, res: Response) => {
    try {
        const {
            name,
            email,
            phone,
            date,
            time,
            numberOfGuests,
            guests, // Accept both field names
            specialRequests,
            message // Accept both field names for special requests
        } = req.body;

        // Use numberOfGuests if provided, otherwise use guests
        const guestsCount = numberOfGuests || guests;

        // Use specialRequests if provided, otherwise use message
        const requests = specialRequests || message || '';

        // Parse guests count (handle "5+" format from frontend)
        let parsedGuests: number;
        if (typeof guestsCount === 'string') {
            if (guestsCount.includes('+')) {
                parsedGuests = parseInt(guestsCount.replace('+', '')) || 5;
            } else {
                parsedGuests = parseInt(guestsCount) || 1;
            }
        } else {
            parsedGuests = Number(guestsCount);
        }

        // Additional validation after parsing
        if (isNaN(parsedGuests) || parsedGuests < 1 || parsedGuests > 20) {
            return res.status(400).json({
                success: false,
                message: 'Number of guests must be between 1 and 20',
            });
        }

        // Validate that the special requests length doesn't exceed limit
        if (requests && requests.length > 500) {
            return res.status(400).json({
                success: false,
                message: 'Special requests must be less than 500 characters'
            });
        }

        // Check if customer exists, if not create one
        let customer = await Customer.findOne({ email });

        if (!customer) {
            // Create new customer
            customer = await Customer.create({
                name,
                email,
                phone,
            });
        }

        // Check for existing reservation at the same date/time
        const reservationDate = new Date(date);
        const nextDay = new Date(reservationDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const existingReservation = await Reservation.findOne({
            date: { $gte: reservationDate, $lt: nextDay },
            time: time,
            status: { $in: ['pending', 'confirmed'] },
        });

        if (existingReservation) {
            return res.status(400).json({
                success: false,
                message: 'This time slot is already booked. Please choose another time.',
            });
        }

        // Create reservation
        const reservation = await Reservation.create({
            customer: customer._id,
            name,
            email,
            phone,
            date: reservationDate,
            time,
            numberOfGuests: parsedGuests,
            specialRequests: requests,
        });

        const populatedReservation = await Reservation.findById(reservation._id).populate(
            'customer',
            'name email phone'
        );

        res.status(201).json({
            success: true,
            message: 'Reservation created successfully! We will confirm shortly.',
            data: populatedReservation,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

// @route   PUT /api/reservations/:id
// @desc    Update reservation (Admin only)
// @access  Private
router.put('/:id', protect, validateIdParam, validateReservationUpdate, async (req: AuthRequest, res: Response) => {
    try {
        const reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        }).populate('customer', 'name email phone');

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservation not found',
            });
        }

        res.json({
            success: true,
            message: 'Reservation updated successfully',
            data: reservation,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

// @route   PATCH /api/reservations/:id/status
// @desc    Update reservation status
// @access  Private
router.patch('/:id/status', protect, validateIdParam, validateReservationStatus, async (req: AuthRequest, res: Response) => {
    try {
        const { status } = req.body;

        const reservation = await Reservation.findById(req.params.id);

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservation not found',
            });
        }

        // Prevent certain status transitions
        if (reservation.status === 'completed' && status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Cannot change status of a completed reservation',
            });
        }

        if (reservation.status === 'cancelled' && status !== 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Cannot reactivate a cancelled reservation',
            });
        }

        reservation.status = status;
        await reservation.save();

        res.json({
            success: true,
            message: `Reservation status updated to ${status}`,
            data: reservation,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// @route   DELETE /api/reservations/:id
// @desc    Cancel reservation
// @access  Private
router.delete('/:id', protect, validateIdParam, async (req: AuthRequest, res: Response) => {
    try {
        const reservation = await Reservation.findById(req.params.id);

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservation not found',
            });
        }

        // Only allow cancellation if not already completed
        if (reservation.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel a completed reservation',
            });
        }

        // Only allow cancellation if not already cancelled
        if (reservation.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Reservation is already cancelled',
            });
        }

        reservation.status = 'cancelled';
        await reservation.save();

        res.json({
            success: true,
            message: 'Reservation cancelled successfully',
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

export default router;