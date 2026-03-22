export const transportFareByMode = (distance: number, mode: string) => {

  if (mode === "train") {
    // Real Indian Railway Train Fare Estimate
    if (distance <= 50) return 70;
    if (distance <= 100) return 120;
    if (distance <= 200) return 250;
    return 350;
  }

  if (mode === "bus") {
    // State Transport Estimate
    if (distance <= 50) return 100;
    if (distance <= 100) return 140;
    if (distance <= 200) return 220;
    return 300;
  }

  if (mode === "flight") {
    // Short flight estimate (very rough)
    return 1500 + distance * 1.2;
  }

  if (mode === "car") {
    // Intercity taxi approximate
    return Math.round(distance * 12);
  }

  // default fallback
  return Math.round(distance * 10);
};
export const localTravelByMode = (days:number, mode:string) => {
  if (mode === "cab") return days * 600;     // ~₹600/day
  if (mode === "metro") return days * 150;   // Delhi/BLR metro cost
  if (mode === "bus") return days * 120;     // City bus cost
  if (mode === "auto") return days * 300;    // Auto rickshaw daily
  return days * 200;
};