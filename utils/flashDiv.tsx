export const flashDiv = async (target: HTMLElement) => {
    target.style.transition = '100ms';
    target.style.background = 'rgb(255, 255, 255, 1)';
    setTimeout(() => {
        target.style.transition = '1s';
        target.style.background = 'rgb(255, 255, 255, 0)';
    }, 100)
    return
}