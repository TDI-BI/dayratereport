//animates a flash of our div
export const flashDiv = async (target: HTMLElement) => {

    target.style.transition = "200ms";
    target.style.background = "rgb(239, 68, 68, 1)";
    setTimeout(() => {
        target.style.transition = "2s";
        target.style.background = "rgb(239, 68, 68, 0)";
    }, 100);
    return;
};
