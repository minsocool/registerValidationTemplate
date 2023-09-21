// Contructor function

function Validator(options) {
  //   Get element of form need validate
  //   console.log(options);

  var selectorRules = {};
  var imagePicker = document.querySelector("#image-picker");
  let inputFile = document.querySelector("#avatar");
  // console.log(imagePicker, inputFile);
  inputFile.onchange = function () {
    imagePicker.src = URL.createObjectURL(inputFile.files[0]);
  };

  // form-1
  var formElement = document.querySelector(options.form);
  if (formElement) {
    // Event submit
    formElement.onsubmit = function (e) {
      // Bỏ đi tính năng mặc định
      e.preventDefault();
      var isFormValid = true;

      // Lặp qua từng rule và validate
      options.rules.forEach(function (rule) {
        var inputElement = formElement.querySelector(rule.selector);
        var isValid = validate(inputElement, rule);
        // console.log(isValid) // false when not valid
        // isValid = errorMessage được return về
        // Nếu 1 selector không valid (isValid = !errorMessage = true khi không valid) và ngược lại = false khi valid
        if (!isValid) {
          isFormValid = false; // có 1 hay hơn selector không valid
        }
      });

      // Cách lấy value trong input
      // var formValue = Array.from(validInputs).reduce(function(values,input) {

      //   return (values[input.name] = input.value) && values
      // },{})

      // Trả về 1 nodelist có 4 phần tử(fullname,email,password,confirmpassword)
      // Đối với 1 nodelist không thể sử dụng các method của 1 mảng
      // Cho nên ta phải convert nodelist thành mảng để sử dụng "reduce" bằng cách dùng Array.form
      // console.log(validInputs)
      // Trường hợp form valid
      if (isFormValid) {
        // Trường hợp submit với javascript
        if (typeof options.onSubmit === "function") {
          var validInputs = formElement.querySelectorAll(
            "[name]:not([disabled])"
          );
          // gọi formElement(form-1) select tất cả input(field) có attribute là name và không có attribute là disabled
          var formValue = Array.from(validInputs).reduce(function (
            values,
            input
          ) {
            switch (input.type) {
              case "radio":
                // Radio chỉ cần trả 1 value
                values[input.name] = formElement.querySelector(
                  'input[name="' + input.name + '"]:checked'
                ).value;
                break;
              case "checkbox":
                if (!input.matches(":checked")) {
                  values[input.name] = "";
                  return values;
                }
                // Nếu không checked thì return values như bên dưới
                // Checkbox phải trả về 1 cái array để push các value vào array đó
                if (!Array.isArray(values[input.name])) {
                  // Nếu không phải array thì cho nó là array rỗng
                  values[input.name] = [];
                }
                // Push value vào mảng [input.name]
                values[input.name].push(input.value);
                break;
              case "file":
                values[input.name] = input.files;
                break;
              default:
                values[input.name] = input.value;
            }
            return values;
            // Return input.value và values
          },
            {});
          options.onSubmit(formValue);
        }
        // Trường hợp submit với hành vi mặc định
        else {
          formElement.submit();
        }
      }
    };
    function getParent(element, selector) {
      while (element.parentElement) {
        if (element.parentElement.matches(selector)) {
          return element.parentElement;
        }
        element = element.parentElement;
      }
    }
    //  Lặp qua mỗi rule và xử lý ( lắng nghe sự kiện blur, input value , ....)
    options.rules.forEach(function (rule) {
      // Save rules for each input element

      if (Array.isArray(selectorRules[rule.selector])) {
        // 2 rule trở lên
        // Đẩy các rule(2 rule trở lên) vào 1 mảng
        selectorRules[rule.selector].push(rule.test);
      } else {
        // Nếu không phải là Array => gán cho selectorRules là phần tử đầu tiên của rule
        // Tóm gọn là lại selector nào có 1 rule thì lọt vào đây
        selectorRules[rule.selector] = [rule.test];
      }

      var inputElements = formElement.querySelectorAll(rule.selector);

      Array.from(inputElements).forEach(function (inputElement) {
        // console.log(inputElement);
        // handle Case:  Blur outInput
        if (inputElement) {
          inputElement.onblur = function () {
            validate(inputElement, rule);
          };
        }
        //   handle Case : When user typing into input
        inputElement.oninput = function () {
          var errorElement = getParent(
            inputElement,
            options.formGroupSelector
          ).querySelector(options.errorMessageSelector);
          errorElement.innerText = "";
          getParent(inputElement, options.formGroupSelector).classList.remove(
            "invalid"
          );
        };
      });
    });
    // console.log(selectorRules)
  }

  // Hàm thực hiện validate
  function validate(inputElement, rule) {
    // value : inputElement.value (input)
    // test func : rule.test
    // console.log(rule);

    // Vòng lặp while vô hạn (tìm parentElement(form-group) trong khi inputElement có quá nhiều tags chứa nó)
    // lặp qua các thẻ chứa input khi tìm thấy element (matches) với parentElement(form-group) thì return ra
    // Khi không tìm thấy thì vẫn gán cho element bằng giá trị trước đó để đảm bảo vòng lặp không bị vô hạn
    function getParent(element, selector) {
      while (element.parentElement) {
        if (element.parentElement.matches(selector)) {
          return element.parentElement;
        }
        element = element.parentElement;
      }
    }

    // var errorElement = inputElement.parentElement.querySelector(
    //   options.errorMessageSelector
    // );

    var errorElement = getParent(
      inputElement,
      options.formGroupSelector
    ).querySelector(options.errorMessageSelector);
    //   options.errorMessageSelector = '.form-message
    //  Cách lấy form message tương ứng với mỗi form group
    // giả sử thông qua form-group của "name" ta sẽ lấy được form message của chính nó
    //   console.log(
    //     inputElement.parentElement.querySelector(".form-message")
    //   );         //    <span class="form-message"></span>
    var errorMessage;

    // Lấy ra các rule của selector (có 2 rule trở lên)

    var rules = selectorRules[rule.selector];

    // lặp qua từng rule & kiểm tra có error message
    // Có error thì break the loop
    for (var i = 0; i < rules.length; i++) {
      switch (inputElement.type) {
        case "radio":
        case "checkbox":
          errorMessage = rules[i](
            formElement.querySelector(rule.selector + ":checked")
          );
          break;
        default:
          errorMessage = rules[i](inputElement.value);
      }

      // errorMessage = rules[i](inputElement.value);
      if (errorMessage) break;
    }

    //   console.log(errorMessage);
    if (errorMessage) {
      errorElement.innerText = errorMessage;
      getParent(inputElement, options.formGroupSelector).classList.add(
        "invalid"
      );
    } else {
      errorElement.innerText = "";
      getParent(inputElement, options.formGroupSelector).classList.remove(
        "invalid"
      );
    }
    // hàm trả lại true nếu (có lỗi)
    // Ngược lại false nếu ( không có lỗi)
    // Lấy đầu ra để check đã valid và submit log ra data
    return !errorMessage;
  }
}

// Define rules
// Principles of rules
// 1. Khi có lỗi => return message err
// 2. Khi không lỗi => return nothing (undefined)
Validator.isRequired = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      // check value
      return value ? undefined : message || "Please enter your full name";
    },
  };
};

Validator.isEmail = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // ( biểu thức chính quy )
      return regex.test(value)
        ? undefined
        : message || "This field must be email";
    },
  };
};

Validator.minLength = function (selector, min) {
  return {
    selector: selector,
    test: function (value) {
      return value.length >= min
        ? undefined
        : `Please enter a minimum of ${min} characters`;
    },
  };
};

Validator.isConfirm = function (selector, getConfirmValue, message) {
  return {
    selector: selector,
    test: function (value) {
      return value === getConfirmValue()
        ? undefined
        : message || `The value entered is incorrect`;
    },
  };
};
