type Props = {
  size?: number;
  className?: string;
};

export default function BambooAvatar({ size = 24, className = "" }: Props) {
  return (
    <img
      src="/images/bamboo-logo.svg"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
}
