let setGlobalLoading = () => {};

export const loaderInstance = {
  set: (status) => {
    setGlobalLoading(status);
  },
  register: (setter) => {
    setGlobalLoading = setter;
  },
};
