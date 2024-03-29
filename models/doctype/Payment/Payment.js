const utils = require('../../../accounting/utils');

module.exports = {
  name: 'Payment',
  label: 'Payment',
  isSingle: 0,
  isChild: 0,
  isSubmittable: 1,
  keywordFields: [],
  settings: 'PaymentSettings',
  fields: [
    {
      fieldname: 'party',
      label: 'Party',
      fieldtype: 'Link',
      target: 'Party',
      required: 1
    },
    {
      fieldname: 'date',
      label: 'Posting Date',
      fieldtype: 'Date',
      defaultValue: new Date().toISOString()
    },
    {
      fieldname: 'account',
      label: 'From Account',
      fieldtype: 'Link',
      target: 'Account',
      required: 1,
      getFilters: (query, doc) => {
        if (doc.paymentType === 'Pay') {
          if (doc.paymentMethod === 'Cash') {
            return { accountType: 'Cash', isGroup: 0 };
          } else {
            return { accountType: ['in', ['Bank', 'Cash']], isGroup: 0 };
          }
        }
      }
    },
    {
      fieldname: 'paymentType',
      label: 'Payment Type',
      fieldtype: 'Select',
      options: ['', 'Receive', 'Pay'],
      required: 1
    },
    {
      fieldname: 'paymentAccount',
      label: 'To Account',
      fieldtype: 'Link',
      target: 'Account',
      required: 1,
      getFilters: (query, doc) => {
        if (doc.paymentType === 'Receive') {
          if (doc.paymentMethod === 'Cash') {
            return { accountType: 'Cash', isGroup: 0 };
          } else {
            return { accountType: ['in', ['Bank', 'Cash']], isGroup: 0 };
          }
        }
      }
    },
    {
      fieldname: 'paymentMethod',
      label: 'Payment Method',
      fieldtype: 'Select',
      options: ['', 'Cash', 'Cheque', 'Transfer'],
      required: 1
    },
    {
      fieldname: 'referenceId',
      label: 'Ref. / Cheque No.',
      fieldtype: 'Data',
      required: 1 // TODO: UNIQUE
    },
    {
      fieldname: 'referenceDate',
      label: 'Ref. Date',
      fieldtype: 'Date'
    },
    {
      fieldname: 'clearanceDate',
      label: 'Clearance Date',
      fieldtype: 'Date',
      hidden: doc => {
        return doc.paymentMethod === 'Cash' ? 1 : 0;
      }
    },
    {
      fieldname: 'amount',
      label: 'Amount',
      fieldtype: 'Currency',
      required: 1,
      readOnly: 1,
      formula: doc => doc.getSum('for', 'amount')
    },
    {
      fieldname: 'writeoff',
      label: 'Write Off / Refund',
      fieldtype: 'Currency'
    },
    {
      fieldname: 'for',
      label: 'Payment For',
      fieldtype: 'Table',
      childtype: 'PaymentFor',
      required: 1
    }
  ],

  quickEditFields: [
    'party',
    'date',
    'account',
    'paymentType',
    'paymentMethod',
    'paymentAccount',
    'referenceId',
    'referenceDate',
    'clearanceDate',
    'amount',
    'writeoff',
    'for'
  ],

  layout: [
    {
      columns: [
        {
          fields: ['party', 'account']
        },
        {
          fields: ['date', 'paymentAccount']
        }
      ]
    },
    {
      columns: [
        {
          fields: ['paymentMethod']
        },
        {
          fields: ['paymentType']
        },
        {
          fields: ['referenceId']
        }
      ]
    },
    {
      columns: [
        {
          fields: ['referenceDate']
        },
        {
          fields: ['clearanceDate']
        }
      ]
    },
    {
      columns: [
        {
          fields: ['for']
        }
      ]
    },
    {
      columns: [
        {
          fields: ['amount', 'writeoff']
        }
      ]
    }
  ],

  links: [utils.ledgerLink]
};
