export function isPeaceGesture(landmarks) {

    if (!landmarks) return false;

    // Index finger
    const indexUp =
        landmarks[8].y < landmarks[6].y;

    // Middle finger
    const middleUp =
        landmarks[12].y < landmarks[10].y;

    // Ring finger
    const ringDown =
        landmarks[16].y > landmarks[14].y;

    // Pinky
    const pinkyDown =
        landmarks[20].y > landmarks[18].y;

    return (
        indexUp &&
        middleUp &&
        ringDown &&
        pinkyDown
    );

}    