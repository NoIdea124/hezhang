import { getCategoryIcon } from '@hezhang/shared';

interface Props {
  name: string;
  size?: number;
}

export default function CategoryIcon({ name, size = 24 }: Props) {
  return (
    <span style={{ fontSize: size, lineHeight: 1 }}>
      {getCategoryIcon(name)}
    </span>
  );
}
