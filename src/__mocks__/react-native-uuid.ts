let counter = 0;
const uuid = {
  v4: () => `mock-uuid-${++counter}`,
};
export default uuid;
