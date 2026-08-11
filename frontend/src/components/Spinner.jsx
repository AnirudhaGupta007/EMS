import React from "react";

const Spinner = () => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
      <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default Spinner;
