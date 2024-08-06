declare module 'mammoth' {
    interface MammothOptions {
      text: string;
    }
  
    interface MammothResult {
      value: string;
      messages: any[];
    }
  
    function extractRawText(options: MammothOptions): Promise<MammothResult>;
  
    const mammoth: {
      extractRawText: typeof extractRawText;
    };
  
    export = mammoth;
  }