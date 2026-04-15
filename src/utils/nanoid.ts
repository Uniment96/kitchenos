import 'react-native-uuid';
import { v4 as uuidv4 } from 'react-native-uuid';

/** Generate a unique ID (UUID v4). */
export function nanoid(): string {
  return uuidv4() as string;
}
