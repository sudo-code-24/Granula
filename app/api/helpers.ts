export const validateIsActiveParams = (paramsIsActive: string | null): boolean => {
    const validIsActiveValue = [null, 'true', 'false']
    if (!validIsActiveValue.includes(paramsIsActive)) {
        return false;
    }
    return true
}

export const parseIsActive = (paramsIsActive: string | null): Boolean | null => {
    let isActive: Boolean | null = null;
    if (paramsIsActive != null) {
        isActive = paramsIsActive.toLocaleLowerCase() == 'true'
    }
    return isActive;
}