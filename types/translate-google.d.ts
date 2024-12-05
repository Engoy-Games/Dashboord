declare module 'translate-google' {
    type TranslateOptions = {
      from?: string;
      to: string;
    };
  
    function translate(text: string, options?: TranslateOptions): Promise<string>;
  
    export = translate;
  }
  