import { withInstall } from '../utils/install';
import table from '@/components/ptTable/index.vue';
import {
  type PtTableEmits,
  type PtTableMethods,
  type PtTableProps
} from 'types/PtTable/prop';
import Variables from '@/utils/constants';

const PtTable = withInstall<PtTableProps, PtTableMethods, PtTableEmits>(
  Variables.name.table,
  table
);

export default PtTable;
