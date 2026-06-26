export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function formatTopics(topics: string[], max = 4): string {
  if (topics.length <= max) {
    return topics.join("、");
  }

  return `${topics.slice(0, max).join("、")} 等`;
}
