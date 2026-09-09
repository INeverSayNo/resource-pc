export interface Props {
  show?: boolean;
  fileUri: string;
}
export const filePreviewProps = {
  show: {
    type: Boolean,
    default: () => false
   },
   fileUri: {
     type: String,
     default: () => ""
   },
   zIndex: {
    type: Number,
    default: () => 4000
   } 
}
