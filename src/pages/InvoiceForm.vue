<template>
  <div class="flex flex-col" v-if="doc">
    <PageHeader>
      <a
        class="cursor-pointer font-semibold flex items-center"
        slot="title"
        @click="routeToList"
      >
        <feather-icon name="chevron-left" class="w-5 h-5" />
        <span class="ml-1">{{ _('Back') }}</span>
      </a>
      <template slot="actions">
        <Button class="text-gray-900 text-xs" @click="openInvoiceSettings">
          {{ _('Customise') }}
        </Button>
        <Dropdown
          v-if="actions && actions.length"
          class="text-xs"
          :items="actions"
          right
        >
          <template v-slot="{ toggleDropdown }">
            <Button
              class="text-gray-900 text-xs ml-2"
              :icon="true"
              @click="toggleDropdown()"
            >
              <feather-icon name="more-horizontal" class="w-4 h-4" />
            </Button>
          </template>
        </Dropdown>
        <Button
          v-if="showSave"
          type="primary"
          class="text-white text-xs ml-2"
          @click="onSaveClick"
          >{{ _('Save') }}</Button
        >
        <Button
          v-if="!doc._dirty && !doc._notInserted && !doc.submitted"
          type="primary"
          class="text-white text-xs ml-2"
          @click="onSubmitClick"
          >{{ _('Submit') }}</Button
        >
      </template>
    </PageHeader>
    <div
      class="flex justify-center flex-1 mb-8 mt-6"
      v-if="meta"
      :class="doc.submitted && 'pointer-events-none'"
    >
      <div
        class="border rounded-lg shadow h-full flex flex-col justify-between"
        style="width: 600px"
      >
        <div>
          <div class="px-6 pt-6" v-if="printSettings">
            <div class="flex text-sm text-gray-900 border-b pb-4">
              <div class="w-1/3">
                <div v-if="printSettings.displayLogo">
                  <img
                    class="h-12 max-w-32 object-contain"
                    :src="printSettings.logo"
                  />
                </div>
                <div class="text-xl text-gray-700 font-semibold" v-else>
                  {{ companyName }}
                </div>
              </div>
              <div class="w-1/3">
                <div>{{ printSettings.email }}</div>
                <div class="mt-1">{{ printSettings.phone }}</div>
              </div>
              <div class="w-1/3">
                <div v-if="address">{{ address.addressDisplay }}</div>
              </div>
            </div>
          </div>
          <div class="mt-8 px-6">
            <div class="flex justify-between">
              <div class="w-1/3">
                <h1 class="text-2xl font-semibold">
                  {{ doc._notInserted ? _('New Invoice') : doc.name }}
                </h1>
                <FormControl
                  class="mt-2"
                  input-class="bg-gray-100 rounded-lg px-3 py-2 text-base"
                  :df="meta.getField('date')"
                  :value="doc.date"
                  :placeholder="'Date'"
                  @change="value => doc.set('date', value)"
                  :read-only="doc.submitted"
                />
                <FormControl
                  class="mt-2 text-base"
                  input-class="bg-gray-100 rounded-lg px-3 py-2 text-base"
                  :df="meta.getField('account')"
                  :value="doc.account"
                  :placeholder="'Account'"
                  @change="value => doc.set('account', value)"
                  :read-only="doc.submitted"
                />
              </div>
              <div class="w-1/3">
                <FormControl
                  class="text-base"
                  input-class="bg-gray-100 rounded-lg p-2 text-right text-lg font-semibold"
                  :df="meta.getField(partyField.fieldname)"
                  :value="doc[partyField.fieldname]"
                  :placeholder="partyField.label"
                  @change="value => doc.set(partyField.fieldname, value)"
                  @new-doc="party => doc.set(partyField.fieldname, party.name)"
                  :read-only="doc.submitted"
                />
                <div
                  v-if="partyDoc"
                  class="mt-1 text-xs text-gray-600 text-right"
                >
                  {{ partyDoc.addressDisplay }}
                </div>
                <div
                  v-if="partyDoc && partyDoc.gstin"
                  class="mt-1 text-xs text-gray-600 text-right"
                >
                  GSTIN: {{ partyDoc.gstin }}
                </div>
              </div>
            </div>
          </div>
          <div class="px-6 text-base">
            <FormControl
              :df="meta.getField('items')"
              :value="doc.items"
              :showHeader="true"
              @change="value => doc.set('items', value)"
              :read-only="doc.submitted"
            />
          </div>
        </div>
        <div class="px-6 mb-6 flex justify-end text-base">
          <div class="w-64">
            <div class="flex pl-2 justify-between py-3 border-b">
              <div>{{ _('Subtotal') }}</div>
              <div>{{ frappe.format(doc.netTotal, 'Currency') }}</div>
            </div>
            <div
              class="flex pl-2 justify-between py-3"
              v-for="tax in doc.taxes"
              :key="tax.name"
            >
              <div>{{ tax.account }} ({{ tax.rate }}%)</div>
              <div>{{ frappe.format(tax.amount, 'Currency') }}</div>
            </div>
            <div
              class="flex pl-2 justify-between py-3 border-t text-green-600 font-semibold text-base"
            >
              <div>{{ _('Grand Total') }}</div>
              <div>{{ frappe.format(doc.grandTotal, 'Currency') }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import PageHeader from '@/components/PageHeader';
import Button from '@/components/Button';
import FormControl from '@/components/Controls/FormControl';
import Row from '@/components/Row';
import Dropdown from '@/components/Dropdown';
import { openSettings } from '@/pages/Settings/utils';
import { showMessageDialog } from '@/utils';

export default {
  name: 'InvoiceForm',
  props: ['doctype', 'name'],
  components: {
    PageHeader,
    Button,
    FormControl,
    Row,
    Dropdown
  },
  provide() {
    return {
      doctype: this.doctype,
      name: this.name
    };
  },
  data() {
    return {
      doc: null,
      partyDoc: null,
      printSettings: null,
      companyName: null
    };
  },
  computed: {
    meta() {
      return frappe.getMeta(this.doctype);
    },
    itemsMeta() {
      return frappe.getMeta(`${this.doctype}Item`);
    },
    itemTableFields() {
      return this.itemsMeta.tableFields.map(fieldname =>
        this.itemsMeta.getField(fieldname)
      );
    },
    itemTableColumnRatio() {
      return [0.3].concat(this.itemTableFields.map(_ => 1));
    },
    partyField() {
      let fieldname = {
        SalesInvoice: 'customer',
        PurchaseInvoice: 'supplier'
      }[this.doctype];
      return this.meta.getField(fieldname);
    },
    address() {
      return this.printSettings && this.printSettings.getLink('address');
    },
    showSave() {
      return this.doc && (this.doc._notInserted || this.doc._dirty);
    },
    actions() {
      if (!this.doc) return null;
      let deleteAction = {
        component: {
          template: `<span class="text-red-700">{{ _('Delete') }}</span>`
        },
        condition: doc => !doc.isNew() && !doc.submitted,
        action: () => {
          showMessageDialog({
            message: this._('Are you sure you want to delete {0} "{1}"?', [
              this.doctype,
              this.name
            ]),
            description: this._('This action is permanent'),
            buttons: [
              {
                label: 'Delete',
                action: () => {
                  this.doc.delete().then(() => {
                    this.routeToList();
                  });
                }
              },
              {
                label: 'Cancel',
                action() {}
              }
            ]
          });
        }
      };
      let actions = [...(this.meta.actions || []), deleteAction]
        .filter(d => (d.condition ? d.condition(this.doc) : true))
        .map(d => {
          return {
            label: d.label,
            component: d.component,
            action: d.action.bind(this, this.doc, this)
          };
        });

      return actions;
    }
  },
  async mounted() {
    this.doc = await frappe.getDoc(this.doctype, this.name);
    this.doc.on('change', ({ changed }) => {
      if (changed === this.partyField.fieldname) {
        this.fetchPartyDoc();
      }
    });
    this.fetchPartyDoc();
    this.printSettings = await frappe.getSingle('PrintSettings');
    this.companyName = (
      await frappe.getSingle('AccountingSettings')
    ).companyName;

    let query = this.$route.query;
    if (query.values && query.doctype === this.doctype) {
      this.doc.set(this.$router.currentRoute.query.values);
    }
  },
  methods: {
    async addNewItem() {
      this.doc.append('items');
    },
    async onSaveClick() {
      await this.doc.set(
        'items',
        this.doc.items.filter(row => row.item)
      );
      await this.doc.insertOrUpdate();
    },
    async onSubmitClick() {
      await this.doc.submit();
    },
    async makePayment() {
      let payment = await frappe.getNewDoc('Payment');
      payment.once('afterInsert', () => {
        payment.submit();
      });
      this.$router.push({
        query: {
          edit: 1,
          doctype: 'Payment',
          name: payment.name,
          hideFields: ['party', 'date', 'account', 'paymentType', 'for'],
          values: {
            party: this.doc[this.partyField.fieldname],
            account: this.doc.account,
            date: new Date().toISOString().slice(0, 10),
            paymentType: this.doctype === 'SalesInvoice' ? 'Receive' : 'Pay',
            for: [
              {
                referenceType: this.doctype,
                referenceName: this.doc.name,
                amount: this.doc.outstandingAmount
              }
            ]
          }
        }
      });
    },
    async fetchPartyDoc() {
      if (this.doc[this.partyField.fieldname]) {
        this.partyDoc = await frappe.getDoc(
          'Party',
          this.doc[this.partyField.fieldname]
        );
      }
    },
    openInvoiceSettings() {
      openSettings('Invoice');
    },
    routeToList() {
      this.$router.push(`/list/${this.doctype}`);
    }
  }
};
</script>
