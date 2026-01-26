// utils/productQueryBuilder.ts

// Valid categories from your Product model
export type ValidCategory =
    | 'coffee'
    | 'grill'
    | 'fast-food'
    | 'breakfast'
    | 'asian'
    | 'american'
    | 'italian'
    | 'salads'
    | 'main-course'
    | 'mediterranean'
    | 'european'
    | 'beverages'
    | 'desserts';

interface ProductQueryParams {
    category?: string;
    isActive?: string;
    isFeatured?: string;
    minPrice?: string;
    maxPrice?: string;
    tags?: string;
    search?: string;
}

interface ProductQuery {
    category?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    price?: {
        $gte?: number;
        $lte?: number;
    };
    tags?: {
        $in: string[];
    };
    $or?: Array<{
        name?: { $regex: string; $options: string };
        description?: { $regex: string; $options: string };
    }>;
}

export const buildProductQuery = (params: ProductQueryParams): ProductQuery => {
    const query: ProductQuery = {};

    // Filter by category (validate against enum)
    if (params.category) {
        const validCategories: ValidCategory[] = [
            'coffee', 'grill', 'fast-food', 'breakfast', 'asian',
            'american', 'italian', 'salads', 'main-course',
            'mediterranean', 'european', 'beverages', 'desserts'
        ];

        if (validCategories.includes(params.category as ValidCategory)) {
            query.category = params.category;
        }
    }

    // Filter by active status
    if (params.isActive !== undefined) {
        if (params.isActive === 'true' || params.isActive === 'false') {
            query.isActive = params.isActive === 'true';
        }
    }

    // Filter by featured
    if (params.isFeatured !== undefined) {
        if (params.isFeatured === 'true' || params.isFeatured === 'false') {
            query.isFeatured = params.isFeatured === 'true';
        }
    }

    // Filter by price range
    if (params.minPrice || params.maxPrice) {
        query.price = {};
        if (params.minPrice) {
            const min = Number(params.minPrice);
            if (!isNaN(min) && min >= 0) {
                query.price.$gte = min;
            }
        }
        if (params.maxPrice) {
            const max = Number(params.maxPrice);
            if (!isNaN(max) && max >= 0) {
                query.price.$lte = max;
            }
        }
    }

    // Filter by tags
    if (params.tags) {
        const tagArray = params.tags
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);

        if (tagArray.length > 0) {
            query.tags = { $in: tagArray };
        }
    }

    // Search by name or description
    if (params.search) {
        const searchTerm = params.search.trim();
        if (searchTerm.length > 0) {
            query.$or = [
                { name: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } },
            ];
        }
    }

    return query;
};

interface SortParams {
    sort?: string;
}

export const buildSortOption = (params: SortParams): any => {
    const { sort } = params;

    switch (sort) {
        case 'price-asc':
            return { price: 1 };
        case 'price-desc':
            return { price: -1 };
        case 'name-asc':
            return { name: 1 };
        case 'name-desc':
            return { name: -1 };
        case 'rating':
            return { 'rating.stars': -1 };
        default:
            return { createdAt: -1 };
    }
};