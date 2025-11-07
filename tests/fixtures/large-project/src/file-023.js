// File 23
// TEMPLATE_ONLY_START
function templateOnlyFunction23() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction23() {
  return 'production-23';
}

// @template-only
const templateVar23 = 'should be removed';

module.exports = {
  productionFunction23
};
