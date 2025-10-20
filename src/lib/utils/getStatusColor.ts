export function getStatusColorClass(status: string): string {
  const statusLower = status.toLowerCase();
  if (statusLower.includes('undetected')) return 'bg-green-500/20 text-green-500';
  if (statusLower.includes('detected')) return 'bg-red-500/20 text-red-500';
  if (statusLower.includes('maintenance')) return 'bg-yellow-500/20 text-yellow-500';
  if (statusLower.includes('updating')) return 'bg-blue-500/20 text-blue-500';
  if (statusLower.includes('expires')) return 'bg-purple-500/20 text-purple-500';
  return 'bg-gray-500/20 text-gray-500';
}
