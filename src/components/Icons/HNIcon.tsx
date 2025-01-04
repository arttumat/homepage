interface Props {
  className?: string;
}
export const HNIcon = ({ className }: Props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 448 512"
    width={24}
    height={24}
    fill="currentColor"
    className={className}
  >
    <path d="M0 32v448h448V32H0zm21.2 197.2H21c.1-.1 .2-.3 .3-.4 0 .1 0 .3-.1 .4zm218 53.9V384h-31.4V281.3L128 128h37.3c52.5 98.3 49.2 101.2 59.3 125.6 12.3-27 5.8-24.4 60.6-125.6H320l-80.8 155.1z" />
  </svg>
);
