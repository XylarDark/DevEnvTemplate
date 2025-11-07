// File 35
// TEMPLATE_ONLY_START
function templateOnlyFunction35() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction35() {
  return 'production-35';
}

// @template-only
const templateVar35 = 'should be removed';

module.exports = {
  productionFunction35
};
