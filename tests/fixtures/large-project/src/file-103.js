// File 103
// TEMPLATE_ONLY_START
function templateOnlyFunction103() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction103() {
  return 'production-103';
}

// @template-only
const templateVar103 = 'should be removed';

module.exports = {
  productionFunction103
};
