const frappe = require('frappejs');
const utils = require('../../../accounting/utils');

module.exports = {
  label: 'Journal Entry',
  name: 'JournalEntry',
  doctype: 'DocType',
  isSingle: 0,
  isChild: 0,
  isSubmittable: 1,
  keywordFields: ['name'],
  showTitle: true,
  settings: 'JournalEntrySettings',
  fields: [
    {
      fieldname: 'entryType',
      label: 'Entry Type',
      fieldtype: 'Select',
      placeholder: 'Entry Type',
      options: [
        'Journal Entry',
        'Bank Entry',
        'Cash Entry',
        'Credit Card Entry',
        'Debit Note',
        'Credit Note',
        'Contra Entry',
        'Excise Entry',
        'Write Off Entry',
        'Opening Entry',
        'Depreciation Entry'
      ],
      required: 1
    },
    {
      fieldname: 'date',
      label: 'Date',
      fieldtype: 'Date'
    },
    {
      fieldname: 'accounts',
      label: 'Account Entries',
      fieldtype: 'Table',
      childtype: 'JournalEntryAccount',
      required: true
    },
    {
      fieldname: 'referenceNumber',
      label: 'Reference Number',
      fieldtype: 'Data'
    },
    {
      fieldname: 'referenceDate',
      label: 'Reference Date',
      fieldtype: 'Date'
    },
    {
      fieldname: 'userRemark',
      label: 'User Remark',
      fieldtype: 'Text',
      placeholder: 'User Remark'
    }
  ],
  layout: [
    // section 1
    {
      columns: [{ fields: ['entryType'] }, { fields: ['date'] }]
    },
    // section 2
    {
      columns: [{ fields: ['accounts'] }]
    },
    // section 3
    {
      columns: [{ fields: ['referenceNumber'] }, { fields: ['referenceDate'] }]
    },
    // section 4
    {
      columns: [{ fields: ['userRemark'] }]
    }
  ]
};
