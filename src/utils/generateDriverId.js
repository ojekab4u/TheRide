const generateDriverId = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let id = "DRV-";
    for (let i = 0; i < 6; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
};

export default generateDriverId;
