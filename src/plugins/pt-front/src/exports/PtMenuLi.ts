import { withInstall } from '../utils/install';
import menuLi from '@/components/ptTable/components/ptMenuLi.vue';
import {
  type PtMenuLiEmits,
  type PtMenuLiMethods,
  type PtMenuLiProps
} from 'types/PtMenuLi/prop';
import Variables from '@/utils/constants';

const PtMenuLi = withInstall<PtMenuLiProps, PtMenuLiMethods, PtMenuLiEmits>(
  Variables.name.ptMenuLi,
  menuLi
);

export default PtMenuLi;
