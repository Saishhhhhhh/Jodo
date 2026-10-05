import { Router } from 'express';
import { PageContent } from '../models/PageContent';
import { requireAuth } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();

export const DEFAULT_PAGE_CONTENTS: Record<string, any> = {
  faqs: {
    pageKey: 'faqs',
    header: {
      tagline: 'The Joy of Together • Help Center',
      title: 'Frequently Asked Questions.',
      subtitle:
        'Everything you need to know about our tool-free click assembly, sustainably crafted hardwoods, flat-pack delivery, and lifetime care.',
      bannerImage: '',
    },
    topicCards: [
      {
        icon: 'puzzle',
        title: 'Tool-Free Assembly',
        category: 'Assembly & Service',
        desc: 'Interlocking click joints. Zero screws, zero allen keys.',
        image: '',
      },
      {
        icon: 'truck',
        title: 'Orders & Delivery',
        category: 'Orders & Delivery',
        desc: 'Flat-packed delivery to 15,000+ pin codes nationwide.',
        image: '',
      },
      {
        icon: 'shield',
        title: 'Materials & Care',
        category: 'Materials & Care',
        desc: 'Architectural plywood, solid hardwood & natural finishes.',
        image: '',
      },
      {
        icon: 'wrench',
        title: 'Warranty & Returns',
        category: 'Warranty & Returns',
        desc: '5-year structural guarantee with 7-day hassle-free returns.',
        image: '',
      },
    ],
    conciergeBanner: {
      tagline: 'Need Personal Assistance?',
      heading: 'Still have a question about your home?',
      description:
        'Our in-house design team is ready to help with custom dimensions, timber swatches, order updates, or assembly assistance.',
      badge1: '5-Year Warranty',
      badge2: 'Free Doorstep Delivery',
      buttonText: 'Contact Concierge',
      buttonUrl: '/contact',
      phoneText: 'Call Us',
      phoneNumber: '+918001234567',
      bannerImage: '',
    },
  },
  blog: {
    pageKey: 'blog',
    header: {
      tagline: 'The Jodo Journal • Stories of Living',
      title: 'Furniture, rituals & the joy of home.',
      subtitle:
        'Design essays, woodworking secrets, living room inspiration, and the quiet satisfaction of making things together.',
      bannerImage: '',
    },
    newsletterBanner: {
      tagline: 'The Jodo Society • Monthly Dispatch',
      heading: 'Bring timeless craft into your inbox.',
      description:
        'Curated essays on architecture, early notice for seasonal timber collections, and the secrets of tool-free furniture.',
      buttonText: 'Join Society',
      bannerImage: '',
    },
  },
};

// Admin routes:
router.use(requireAuth);

router.get('/:pageKey', async (req, res, next) => {
  try {
    const { pageKey } = req.params;
    let content = await PageContent.findOne({ pageKey });

    if (!content && DEFAULT_PAGE_CONTENTS[pageKey]) {
      content = await PageContent.create(DEFAULT_PAGE_CONTENTS[pageKey]);
    }

    if (!content) {
      return sendError(res, `Page content not found for key: ${pageKey}`, 404);
    }

    sendSuccess(res, content);
  } catch (error) {
    next(error);
  }
});

router.put('/:pageKey', async (req, res, next) => {
  try {
    const { pageKey } = req.params;
    const updateData = { ...req.body, pageKey };

    const content = await PageContent.findOneAndUpdate(
      { pageKey },
      updateData,
      { new: true, upsert: true, runValidators: true }
    );

    sendSuccess(res, content, 'Page content updated successfully');
  } catch (error) {
    next(error);
  }
});

export default router;
