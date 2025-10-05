import { Brand, Category, PriceRange, ProductFilter, SortOption } from "@/types/product";

type WithValueLabel = { value: string; label: string };
type WithNameId = { name: string; id: number }

export const defaultFilters: ProductFilter = {
    categoryIds: [],
    brandIds: [],
    priceRange: undefined,
    sort: '',
    search: ""
}

export const sortFilterOptions: { value: SortOption; label: string }[] = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating_asc', label: 'Highest Rated' },
    { value: 'popular', label: 'Most Popular' }
]


export const priceRanges = [
    { key: "UNDER_25", label: "Under $25", value: { min: 0, max: 24 } },
    { key: "25_50", label: "$25 - $50", value: { min: 25, max: 50 } },
    { key: "51_100", label: "$50 - $100", value: { min: 51, max: 100 } },
    { key: "100_250", label: "$100 - $250", value: { min: 100, max: 250 } },
    { key: "250_500", label: "$250 - $500", value: { min: 250, max: 500 } },
    { key: "OVER_500", label: "Over $500", value: { min: 500, max: 0 } },
] as const;

export const priceFilterOptions = priceRanges.map(r => ({
    value: r.key,
    label: r.label,
}));

export const getPriceRangeValues = (range: string): PriceRange | undefined => {
    return priceRanges.find(r => r.key === range)?.value ?? undefined;
}

export const getPriceRangeLabel = (range: PriceRange): string => {
    return priceRanges.find(r => r.value.min === range.min && r.value.max === range.max)?.label
        ?? "All Prices";
}

export const getLabelByValue = <T extends WithValueLabel>(
    arr: T[],
    key: string
): string | undefined => {
    return arr.find(item => item.value === key)?.label;
}

export const getLabelbyId = <T extends WithNameId>(
    arr: T[],
    key: number
): string | undefined => {
    return arr.find(item => item.id === key)?.name;
}

