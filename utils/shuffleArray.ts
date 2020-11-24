export default function shuffleArray<T>(value: T[]) : T[]{
    return value.sort(() => Math.random() * 0.5)
}