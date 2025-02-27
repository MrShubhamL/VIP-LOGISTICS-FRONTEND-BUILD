const userPermissionsList = [
  {
    title: 'Dashboard Access',
    permission: [
      'card-list', 'summary-view', 'graph-view', 'employee-contacts'
    ]
  },
  {
    title: 'Master Access',
    permission: [
      'create-account', 'create-party', 'item-records', 'manage-route', 'vehicle-registration', 'user-management',
      'roles-permissions', 'create-branch', 'security-backup', 'user-profile'
    ]
  },
  {
    title: 'Transaction Access',
    permission: [
      'lorry-receipt', 'mis', 'memo-requests', 'lorry-receipt-temp', 'lorry-hire-memo',
      'freight-group', 'freight-request-group', 'octroi-bill', 'customer-receipt',
      'trip-expenses-voucher', 'other-receipt', 'other-payments', 'journal'
    ]
  },
  {
    title: 'Report Access',
    permission: [
      'booking-register', 'booking-register-II', 'outsider-truck-register', 'company-truck-register',
      'provision-of-billing', 'ledger', 'party-ledger', 'cash-book', 'bank-book', 'trial-balance',
      'sundry-drs-list', 'sundry-crs-list', 'merge'
    ]
  }
];

export default userPermissionsList;
