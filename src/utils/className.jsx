/**
 * classNames - combines multiple class strings into one,
 * ignores falsy values (undefined, null, false)
 *
 * Usage:
 * classNames("base-class", condition && "conditional-class")
 *
 * @param  {...string|boolean} classes
 * @returns {string} combined class string
 */
export const classNames = (...classes) => {
    return classes.filter(Boolean).join(" ");
};

export default classNames;
