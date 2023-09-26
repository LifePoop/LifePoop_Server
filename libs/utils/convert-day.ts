export const convertDayStart = (date: Date): Date => {
  return new Date(date.setHours(0, 0, 0, 0));
};

export const convertDayEnd = (date: Date): Date => {
  return new Date(date.setHours(23, 59, 59, 999));
};
