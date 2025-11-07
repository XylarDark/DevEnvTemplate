// File 78
// TEMPLATE_ONLY_START
function templateOnlyFunction78() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction78() {
  return 'production-78';
}

// @template-only
const templateVar78 = 'should be removed';

module.exports = {
  productionFunction78
};
