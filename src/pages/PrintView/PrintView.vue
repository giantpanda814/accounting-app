<template>
  <div class="flex flex-col">
    <PageHeader>
      <a
        class="cursor-pointer font-semibold flex items-center"
        slot="title"
        @click="$router.back()"
      >
        <feather-icon name="chevron-left" class="w-5 h-5" />
        <span class="ml-1">{{ _('Back') }}</span>
      </a>
      <template slot="actions">
        <DropdownWithAction class="text-base" :items="actions" right>
          <Button class="text-gray-900 text-xs ml-2" :icon="true">
            <feather-icon name="more-horizontal" class="w-4 h-4" />
          </Button>
        </DropdownWithAction>
      </template>
    </PageHeader>
    <div class="flex justify-center flex-1 mb-8 mt-6">
      <div
        v-if="doc"
        class="border rounded-lg shadow h-full flex flex-col justify-between"
        style="width: 600px"
        ref="printContainer"
      >
        <component :is="printTemplate" v-bind="{ doc }" />
      </div>
    </div>
  </div>
</template>
<script>
import PageHeader from '@/components/PageHeader';
import SearchBar from '@/components/SearchBar';
import DropdownWithAction from '@/components/DropdownWithAction';
import Button from '@/components/Button';
import { getPDFForElectron } from 'frappejs/server/pdf';
import { remote } from 'electron';

export default {
  name: 'PrintView',
  props: ['doctype', 'name'],
  components: {
    PageHeader,
    SearchBar,
    DropdownWithAction,
    Button
  },
  data() {
    return {
      doc: null
    };
  },
  async mounted() {
    this.doc = await frappe.getDoc(this.doctype, this.name);
  },
  computed: {
    meta() {
      return frappe.getMeta(this.doctype);
    },
    printTemplate() {
      return this.meta.printTemplate;
    },
    actions() {
      return [
        {
          label: 'Download PDF',
          action: () => {
            this.makePDF();
          }
        }
      ];
    }
  },
  methods: {
    async makePDF() {
      let destination = await this.getSavePath();
      let html = this.$refs.printContainer.innerHTML;
      getPDFForElectron(this.doctype, this.name, destination, html);
    },

    getSavePath() {
      return new Promise(resolve => {
        remote.dialog.showSaveDialog(
          remote.getCurrentWindow(),
          {
            title: this._('Select folder'),
            defaultPath: `${this.name}.pdf`
          },
          filePath => {
            if (filePath) {
              if (!filePath.endsWith('.pdf')) {
                filePath = filePath + '.pdf';
              }
              resolve(filePath);
            }
          }
        );
      });
    }
  }
};
</script>
