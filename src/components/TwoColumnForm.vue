<template>
  <div class="text-sm" :class="{ 'border-t': !noBorder }">
    <template v-for="df in fields">
      <FormControl
        v-if="df.fieldtype === 'Table'"
        ref="controls"
        size="small"
        :df="df"
        :value="doc[df.fieldname]"
        @change="value => onChange(df, value)"
      />
      <template v-else>
        <template v-if="inlineEditField === df && inlineEditDoc">
          <div class="border-b">
            <TwoColumnForm
              :doc="inlineEditDoc"
              :fields="inlineEditFields"
              :column-ratio="columnRatio"
              :no-border="true"
              :focus-first-input="true"
            />
            <div class="flex px-4 pb-2">
              <Button
                class="w-1/2 text-gray-900"
                @click="inlineEditField = null"
              >
                {{ _('Cancel') }}
              </Button>
              <Button
                type="primary"
                class="ml-2 w-1/2 text-white"
                @click="saveInlineEditDoc"
              >
                {{ df.inlineSaveText || _('Save') }}
              </Button>
            </div>
          </div>
        </template>
        <div
          v-else
          class="grid"
          :class="{ 'border-b': !noBorder }"
          :style="style"
        >
          <div
            class="py-2 pl-4 flex items-center"
            :class="validateForm && df.required ? 'text-red-600' : 'text-gray-600'"
          >
            {{ df.label }}
          </div>
          <div class="py-2 pr-4" @click="activateInlineEditing(df)">
            <FormControl
              ref="controls"
              size="small"
              :df="df"
              :value="
                df.inline && doc.getLink(df.fieldname)
                  ? doc.getLink(df.fieldname)[
                      doc.getLink(df.fieldname).meta.inlineEditDisplayField ||
                        'name'
                    ]
                  : doc[df.fieldname]
              "
              @change="value => onChange(df, value)"
              @focus="activateInlineEditing(df)"
            />
          </div>
        </div>
      </template>
    </template>
  </div>
</template>
<script>
import FormControl from '@/components/Controls/FormControl';
import Button from '@/components/Button';

let TwoColumnForm = {
  name: 'TwoColumnForm',
  props: {
    doc: Object,
    fields: Array,
    autosave: Boolean,
    columnRatio: {
      type: Array,
      default: () => [1, 1]
    },
    noBorder: Boolean,
    focusFirstInput: Boolean,
    validateForm: Boolean
  },
  data() {
    return {
      inlineEditField: null,
      inlineEditDoc: null,
      inlineEditFields: null,
      inlineEditDisplayField: null
    };
  },
  provide() {
    return {
      doctype: this.doc.doctype,
      name: this.doc.name
    };
  },
  components: {
    FormControl,
    Button,
    TwoColumnForm: () => TwoColumnForm
  },
  mounted() {
    if (this.focusFirstInput) {
      this.$refs['controls'][0].focus();
    }
  },
  methods: {
    onChange(df, value) {
      if (value == null) {
        return;
      }
      let oldValue = this.doc.get(df.fieldname);

      if (oldValue === value) {
        return;
      }

      // handle rename
      if (this.autosave && df.fieldname === 'name' && !this.doc.isNew()) {
        return this.doc.rename(value);
        return;
      }

      this.doc.set(df.fieldname, value);

      if (this.autosave && this.doc._dirty && !this.doc.isNew()) {
        if (df.fieldtype === 'Table') {
          return;
        }
        this.doc.update();
      }
    },
    async activateInlineEditing(df) {
      if (df.inline) {
        this.inlineEditField = df;
        if (!this.doc[df.fieldname]) {
          this.inlineEditDoc = await frappe.getNewDoc(df.target);
          this.inlineEditDoc.once('afterInsert', () => {
            this.onChange(df, this.inlineEditDoc.name);
          });
        } else {
          this.inlineEditDoc = this.doc.getLink(df.fieldname);
        }
        this.inlineEditDisplayField =
          this.doc.meta.inlineEditDisplayField || 'name';
        this.inlineEditFields = frappe.getMeta(df.target).getQuickEditFields();
      }
    },
    async saveInlineEditDoc() {
      if (this.inlineEditDoc) {
        await this.inlineEditDoc.insertOrUpdate();
        await this.doc.loadLinks();
        this.inlineEditField = null;
      }
    }
  },
  computed: {
    style() {
      let templateColumns = (this.columnRatio || [1, 1])
        .map(r => `${r}fr`)
        .join(' ');
      return {
        'grid-template-columns': templateColumns
      };
    }
  }
};

export default TwoColumnForm;
</script>
