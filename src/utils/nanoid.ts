import uuid from 'react-native-uuid';

/** Generate a unique ID (UUID v4). */
export function nanoid(): string {
  return uuid.v4() as string;
}
