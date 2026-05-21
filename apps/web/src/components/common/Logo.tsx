import { logo as defaultLogo } from "@/images";
import Image from "next/image";
import Link from "next/link";
interface Props {
  href?: string;
  className?: string;
  imageUrl?: string;
}
const Logo = ({ href = "/", className, imageUrl }: Props) => {
  return (
    <Link href={href}>
      <Image
        width={250}
        height={250}
        src={imageUrl || defaultLogo}
        alt="Logo"
        className={`w-[140px] h-auto object-contain ${className}`}
        loading="eager"
      />
    </Link>
  );
};

export default Logo;
