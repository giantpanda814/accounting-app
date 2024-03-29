<template>
  <div class="flex flex-col">
    <PageHeader>
      <a
        class="cursor-pointer font-semibold"
        slot="title"
        @click="$router.go(-1)"
        >{{ _('Back') }}</a
      >
      <template slot="actions">
        <Button
          v-if="doc._notInserted || doc._dirty"
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
          <div class="mt-8 px-6">
            <h1 class="text-2xl font-semibold">
              {{ doc._notInserted ? _('New Journal Entry') : doc.name }}
            </h1>
            <div class="flex justify-between mt-2">
              <div class="w-1/3">
                <FormControl
                  :df="meta.getField('entryType')"
                  :value="doc.entryType"
                  placeholder="Entry Type"
                  @change="value => doc.set('entryType', value)"
                  input-class="bg-gray-100 rounded-lg px-3 py-2 text-base"
                  :show-label="true"
                />
                <FormControl
                  class="mt-2"
                  :df="meta.getField('date')"
                  :value="doc.date"
                  :placeholder="'Date'"
                  @change="value => doc.set('date', value)"
                  input-class="bg-gray-100 rounded-lg px-3 py-2 text-base"
                  :show-label="true"
                />
              </div>
              <div class="w-1/3">
                <FormControl
                  :df="meta.getField('referenceNumber')"
                  :value="doc.referenceNumber"
                  :placeholder="'Reference Number'"
                  @change="value => doc.set('referenceNumber', value)"
                  input-class="bg-gray-100 rounded-lg p-2 text-base"
                  :show-label="true"
                />
                <FormControl
                  class="mt-2"
                  :df="meta.getField('referenceDate')"
                  :value="doc.date"
                  :placeholder="'Reference Date'"
                  @change="value => doc.set('referenceDate', value)"
                  input-class="bg-gray-100 rounded-lg px-3 py-2 text-base"
                  :show-label="true"
                />
              </div>
            </div>
          </div>
          <div class="mt-2 px-6 text-base">
            <FormControl
              :df="meta.getField('accounts')"
              :value="doc.accounts"
              :showHeader="true"
              @change="value => doc.set('accounts', value)"
              :read-only="doc.submitted"
            />
          </div>
        </div>
        <div class="px-6 mb-6">
          <div
            class="grid items-center border-t pt-3 pr-2"
            style="grid-template-columns: 1.3fr 1fr 1fr"
          >
            <div class="text-sm">
              <FormControl
                :df="meta.getField('userRemark')"
                :value="doc.userRemark"
                @change="value => doc.set('userRemark', value)"
              />
            </div>
            <div class="text-right font-semibold text-green-700 px-3">
              {{ totalDebit }}
            </div>
            <div class="text-right font-semibold text-red-700 px-3">
              {{ totalCredit }}
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

export default {
  name: 'JournalEntryForm',
  props: ['name'],
  components: {
    PageHeader,
    Button,
    FormControl,
    Row,
    Dropdown
  },
  provide() {
    return {
      doctype: 'JournalEntry',
      name: this.name
    };
  },
  data() {
    return {
      doctype: 'JournalEntry',
      meta: null,
      itemsMeta: null,
      doc: {},
      partyDoc: null,
      printSettings: null
    };
  },
  computed: {
    totalDebit() {
      let value = 0;
      if (this.doc.accounts) {
        value = this.doc.getSum('accounts', 'debit');
      }
      return frappe.format(value, 'Currency');
    },
    totalCredit() {
      let value = 0;
      if (this.doc.accounts) {
        value = this.doc.getSum('accounts', 'credit');
      }
      return frappe.format(value, 'Currency');
    }
  },
  async mounted() {
    this.meta = frappe.getMeta(this.doctype);
    this.doc = await frappe.getDoc(this.doctype, this.name);
  },
  methods: {
    async addNewItem() {
      this.doc.append('items');
    },
    async onSaveClick() {
      // await this.doc.set(
      //   'items',
      //   this.doc.items.filter(row => row.item)
      // );
      return this.doc.insertOrUpdate();
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
      this.partyDoc = await frappe.getDoc(
        'Party',
        this.doc[this.partyField.fieldname]
      );
    }
  }
};
</script>
