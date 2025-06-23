// PrinterType can be 'bluetooth', 'usb', or 'network'

// PrinterDevice structure:
// {
//   name: string,
//   address: string,
//   type: PrinterType
// }

// Options for basic text printing
// PrintOptions structure:
// {
//   align?: 'left' | 'center' | 'right',
//   fontSize?: 'small' | 'normal' | 'large',
//   bold?: boolean,
//   cutPaper?: boolean
// }

// Extended options for image/QR printing
// PrinterImageOptions structure:
// {
//   width?: number,
//   left?: number,
//   right?: number,
//   // any other opts supported by the underlying lib
// }

// Helper functions for type checking
export const isValidPrinterType = (type) => {
  return ['bluetooth', 'usb', 'network'].includes(type);
};

export const createPrinterDevice = (name, address, type) => {
  if (!isValidPrinterType(type)) {
    throw new Error(`Invalid printer type: ${type}`);
  }
  return { name, address, type };
};

export const createPrintOptions = (options = {}) => {
  const validAlignments = ['left', 'center', 'right'];
  const validFontSizes = ['small', 'normal', 'large'];

  if (options.align && !validAlignments.includes(options.align)) {
    throw new Error(`Invalid alignment: ${options.align}`);
  }

  if (options.fontSize && !validFontSizes.includes(options.fontSize)) {
    throw new Error(`Invalid font size: ${options.fontSize}`);
  }

  return {
    align: options.align || 'left',
    fontSize: options.fontSize || 'normal',
    bold: Boolean(options.bold),
    cutPaper: Boolean(options.cutPaper)
  };
};
