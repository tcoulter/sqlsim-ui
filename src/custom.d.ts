declare module "*.svg" {
  // Originally from here, but it causes issues: 
  // https://stackoverflow.com/questions/44717164/unable-to-import-svg-files-in-typescript
  // const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  // export default content;

  // So I used this. No idea if this is a hack or not. It works...
  // https://stackoverflow.com/questions/74770826/type-functioncomponentsvgattributessvgelement-is-not-assignable-to-type-s
  const content: any;
  export default content;
}