import type { SVGProps } from 'react';

export type AvangardIconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

function iconProps({ size = 24, ...props }: AvangardIconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': props['aria-label'] ? undefined : true,
    ...props
  };
}

export function HomeIcon(props: AvangardIconProps) {
  return <svg {...iconProps(props)}><path d="M3.5 11.1 12 4l8.5 7.1"/><path d="M5.8 9.8v9.1h12.4V9.8M9.5 18.9v-5.4h5v5.4"/><path d="m16.2 5.5 2.7 2.2"/></svg>;
}

export function ScheduleIcon(props: AvangardIconProps) {
  return <svg {...iconProps(props)}><rect x="3.5" y="5.2" width="17" height="15" rx="2.2"/><path d="M7.5 3.5v3.4m9-3.4v3.4M3.5 9.3h17"/><path d="m8 14 2.1 2.1 5.1-5"/></svg>;
}

export function BookingIcon(props: AvangardIconProps) {
  return <svg {...iconProps(props)}><path d="M5 3.8h12.1a2 2 0 0 1 2 2v14.4l-3.6-2-3.5 2-3.5-2-3.5 2V3.8Z"/><path d="M8.2 8.2h7.6M8.2 11.6h4.8"/><circle cx="15.6" cy="14.2" r="1.8"/></svg>;
}

export function ProfileIcon(props: AvangardIconProps) {
  return <svg {...iconProps(props)}><circle cx="12" cy="8" r="3.4"/><path d="M5.2 20c.5-4.1 2.8-6.2 6.8-6.2s6.3 2.1 6.8 6.2"/><path d="M3.6 12A8.4 8.4 0 0 1 12 3.6M20.4 12A8.4 8.4 0 0 1 12 20.4"/></svg>;
}

export function ArrowIcon(props: AvangardIconProps) {
  return <svg {...iconProps(props)}><path d="M4 12h14.5M13 6.5l5.5 5.5-5.5 5.5"/><path d="M18.5 8.2V12h-3.8"/></svg>;
}

export function BallIcon(props: AvangardIconProps) {
  return <svg {...iconProps(props)}><circle cx="12" cy="12" r="8.5"/><path d="M6.2 5.9c3.5 1.2 6.1 3.4 7.7 6.6M17.8 18.1c-3.5-1.2-6.1-3.4-7.7-6.6M17.9 6.1c-1.2 3.5-3.4 6.1-6.6 7.7M6.1 17.9c1.2-3.5 3.4-6.1 6.6-7.7"/></svg>;
}

export function CourtIcon(props: AvangardIconProps) {
  return <svg {...iconProps(props)}><path d="M3.2 5.2h17.6v13.6H3.2zM12 5.2v13.6M3.2 12h17.6"/><circle cx="12" cy="12" r="2.4"/><path d="M3.2 8.2h3.4v7.6H3.2m17.6-7.6h-3.4v7.6h3.4"/></svg>;
}

export function TeamIcon(props: AvangardIconProps) {
  return <svg {...iconProps(props)}><circle cx="12" cy="7.4" r="2.7"/><circle cx="5.9" cy="10" r="2"/><circle cx="18.1" cy="10" r="2"/><path d="M7.2 19.8c.3-4 1.9-6 4.8-6s4.5 2 4.8 6M2.9 19c.2-3.1 1.3-4.7 3.4-4.7.8 0 1.5.2 2 .7m12.8 4c-.2-3.1-1.3-4.7-3.4-4.7-.8 0-1.5.2-2 .7"/></svg>;
}

export function PinIcon(props: AvangardIconProps) {
  return <svg {...iconProps(props)}><path d="M19 10c0 5.2-7 10.5-7 10.5S5 15.2 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.4"/><path d="M8.5 4.2 12 2.5l3.5 1.7"/></svg>;
}

export function ClockIcon(props: AvangardIconProps) {
  return <svg {...iconProps(props)}><circle cx="12" cy="12" r="8.6"/><path d="M12 6.8V12l3.8 2.2"/><path d="M5.8 5.8 4.2 4.2m14 1.6 1.6-1.6"/></svg>;
}

export function PhoneIcon(props: AvangardIconProps) {
  return <svg {...iconProps(props)}><path d="M7.1 3.8 4.4 5.2c-.8.4-1.1 1.3-.8 2.2 2.2 6.4 6.6 10.8 13 13 .9.3 1.8 0 2.2-.8l1.4-2.7-4.3-2-1.2 2a14.8 14.8 0 0 1-7.6-7.6l2-1.2-2-4.3Z"/><path d="M13.8 5.2a5 5 0 0 1 5 5m-5-8.2a8.2 8.2 0 0 1 8.2 8.2"/></svg>;
}

export function CheckIcon(props: AvangardIconProps) {
  return <svg {...iconProps(props)}><circle cx="12" cy="12" r="8.7"/><path d="m7.8 12.2 2.8 2.8 5.8-6.2"/><path d="M12 3.3c2.3 1.5 4.5 2.3 6.7 2.4"/></svg>;
}
