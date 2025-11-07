// File 20
// TEMPLATE_ONLY_START
function templateOnlyFunction20() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction20() {
  return 'production-20';
}

// @template-only
const templateVar20 = 'should be removed';

module.exports = {
  productionFunction20
};
