import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AuthenticationService} from "../../../../services/authentication.service";
import {ApiServiceService} from "../../../../services/api-service.service";
import {ApiUrls} from "../../../../schemas/apiUrls";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {OnlynumberDirective} from "../../../../customDirectives/onlynumber.directive";
// @ts-ignore
import * as html2pdf from 'html2pdf.js';
import { ModalManager } from 'ngb-modal';
import swal from "sweetalert2";
import Swal from "sweetalert2";
import {DatePipe} from "@angular/common";

@Component({
  selector: 'app-asset-requisition-form',
  templateUrl: './asset-requisition-form.component.html',
  styleUrls: ['./asset-requisition-form.component.css']
})
export class AssetRequisitionFormComponent implements OnInit {
  tab = 1;
  public assetCount: any;
  public getAllAssetList: any;
  public currentUser: any;
  public rejectedList: any;
  public rejectCount: any;
  public viewRejectAssetDetails: any;
  editingQuantity: boolean = false;
  editedQuantity: any;
  data: any = {
    page: 1,
    size: 10,
    pageSizes: [],
    siteId: '',
    indentNumber: '',
  };
  rejectQuery: any = {
    page: 1,
    size: 10,
    pageSizes: [],
  };
  assetQuery: any = {}
  // public assetQuery: any = {
  //   model: '',
  //   description: '',
  //   assetCategory: '',
  //   assetSubCategory: '',
  //   quantity: 0
  // }
  expandedRows: boolean[] = [];
  selectedRowData: any;
  public assetCategoryTypes: Array<any> = [];
  public assetSubCategoryTypes: Array<any> = [];
  public sitesStore: Array<any> = [];
  custodianDetails: any;
  public assetRequisitionId: any;
  dateOfProforma = new Date();
  startExpenseDate = new Date(new Date().getFullYear() + '-' + new Date().getMonth() + '-' + 1);
  public initiatePo: any = {
    vendorName: '',
    vendorPhoneNumber: '',
    vendorEmail: '',
    beneficiaryName: '',
    accountNumber: '',
    ifscCode: '',
    billingAddress: '8th floor,801/A,krishe Block 1-89/3/B/40-42/KS/801A, Krishe Sapphire, Hi-Tech City Road, Madhapur, Hyderabad, Ranagareddy,500081,India,PAN Number: AABCZ2432M,GSTIN 36AABCZ2432M1Z4',
    shippingAddress: '',
    billToEmail: '',
    shipToEmail: '',
    terms: '',
    warranty: '',
    rate: 0,
    preGstAmount: 0,
    gstAmount: 0,
    additionalExpenses: 0,
    totalAmount: 0,
    vendorGstNumber: '',
    vendorAddress: '',
    panCardNumber: '',
    proformaDate: '',
    proformaInvoiceNumber: ''
    // itemsList: [
    //   { quantity: 0, rate: 0, preGstAmount: 0, gstAmount: 0, totalAmount: 0}
    // ]
  }
  public poData: any = {};
  public checkStatus = {
    fieldBoo: false,
    staticBoo: false
  }

  public uploadPanPicDemo: any;
  public previewUrl2: any;
  public imageChangedEvent: any = '';
  public imageArray: Array<any> = [];
  @ViewChild('myModal') myModal: any;
  @ViewChild('viewImageModal') viewImageModal: any;
  @ViewChild('myModal2') myModal2: any;
  @ViewChild('viewRejectModal') viewRejectModal: any;
  public modalRef: any;
  public custodianUploadData: any = {};
  public allErrors: Array<any> = [];
  editIndex: number | null = null;
  public imageFileArray: Array<any> = [];
  public imageFile: any = {
    imageData: '',
    picName: '',
    subUrl: '',
  };
  imageFileArrayData: any = [];
  imageCounts: any = [];
  allUploadedImagesNumber: any = [];
  imagesPathById: any = [];
  constructor(private router: Router,
              private authenticationService: AuthenticationService,
              public  apiService: ApiServiceService,
              private apiUrls: ApiUrls,
              private actRoute: ActivatedRoute,
              private ngModalService: NgbModal,
              public modelService: ModalManager,
              private datePipe: DatePipe,) {
    this.authenticationService.currentUser.subscribe(x => {
      this.currentUser = x;
      console.log(this.currentUser)
    });
    this.initiatePo.proformaDate = this.datePipe.transform(this.dateOfProforma, 'yyyy-MM-dd');
    console.log(this.initiatePo.proformaDate)
  }

  ngOnInit(): void {

    if (this.tab === 1){
      this.getCount();
      this.getSitesForDropDownExpense();
    }
    // this.getSitesForDropDownExpense();
    // this.getAllCategory();
  }

  startEditingQuantity() {
    this.editingQuantity = true;
  }

  saveQuantity() {
    console.log(this.assetQuery.itemsList, '====')
    // this.assetQuery.quantity = this.editedQuantity;
    this.apiService.update(this.apiUrls.updateQuantityByVL + this.assetRequisitionId, {itemsList:this.assetQuery.itemsList}).subscribe((res: any) =>{
      if (res){
        this.getCount();
        this.editingQuantity = false;
        this.editIndex = -1;
        // this.editIndex = null

      }
    })
  }
  startEditing(index: number) {
    this.editIndex = index;
  }

  cancelEditing() {
    this.editIndex = null;
  }
  checkQuantity(event: any) {
    const inputValue = event.target.value;
    if (inputValue < 1) {
      event.target.value = 1;
    }
  }

  cancelEditingQuantity() {
    // Reset the edited quantity to the original value
    // this.editedQuantity = this.assetQuery.quantity || 0;
    // Reset the editing flag
    this.editingQuantity = false;
  }
  getAll(): void{
    this.apiService.getAll(this.apiUrls.getAllAssets, this.data).subscribe((res: any) => {
      if (res){
        this.getAllAssetList = res.content
      }
    });
  }
  getCount(): void{
    this.apiService.getCount(this.apiUrls.getAssetCount, this.data).subscribe((res: any) => {
      // if (res){
        this.assetCount = res;
        OnlynumberDirective.pagination(this.assetCount, this.data);
        this.getAll();
      // }
    })

  }
  getAllRejects(): void{
    this.apiService.getAll(this.apiUrls.getRejectRequestForm, this.rejectQuery).subscribe((res: any) => {
      if (res){
        this.rejectedList = res.content;
      }
    })
  }
  getCountForReject(): void{
    this.apiService.getCount(this.apiUrls.getRejectRequestFormCount, this.data).subscribe((res: any) => {
      if (res){
        this.rejectCount = res;
        OnlynumberDirective.pagination(this.rejectCount, this.rejectQuery);
        this.getAllRejects();
      }
    })

  }
  viewAsset(reject: any): void{
    this.viewRejectAssetDetails = reject;
    console.log(this.viewRejectAssetDetails, '===========')
    if (this.viewRejectAssetDetails) {
      this.modalRef = this.ngModalService.open(this.viewRejectModal, {size: 'lg', backdrop: 'static', keyboard: false});
    }
  }
  deleteAsset(id: any):void{
    this.apiService.update(this.apiUrls.deleteAsset + id, {}).subscribe((res: any) => {
      if (res){
       this.getCount();
      }
    })
  }
  goToDashboard(): void {
    this.router.navigate(['dashboard']);
  }
  handlePageChange(event: any): void {
    this.data.page = event;
    this.getCount();
  }

  handlePageSizeChange(event: any): void {
    this.data.size = event;
    this.data.page = 1;
    this.getCount()
  }
  changeTab(tabKey: any): void {
    this.tab = tabKey ? tabKey : 1;
    switch (this.tab) {
      case 1:
        this.getCount()
        break;
      case 2:
        this.getCountForReject()
        break;
      default:
        break;
    }
  }



//   Swal.fire({
//               title: 'Are you sure?',
//               html: ['<div>You are committing the rental payment for<b style="font-weight: bold"> ' + site.siteCode + ' </b>.</div>'].join(),
//   icon: 'warning',
//   showCancelButton: true,
//   confirmButtonColor: '#28a745',
//   cancelButtonColor: '#d33',
//   confirmButtonText: '<i class="fa fa-thumbs-up"></i> Yes, Commit it!',
// }).then((result) => {
//   if (result.isConfirmed) {
//     this.apiService.create(this.apiUrls.commitSiteRental + site.id, {})
//         .subscribe((response: any) => {
//           if (response === true) {
//             Swal.fire(
//                 'Committed!',
//                 'The rental payment for the ' + site.siteCode + ' have been Committed.',
//                 'success'
//             );
//             this.getRentalData('');
//           } else {
//             Swal.fire(
//                 'Error!',
//                 'Commits are not allowed..!.',
//                 'error'
//             );
//           }
//         });
//   }
// });
  commit(asset: any): void {
    console.log(asset.attrs)
    swal.fire({
      title: 'Are you sure to ' + asset.attrs.currentStatus + '?' ,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#d33',
      confirmButtonText: '<i class="fa fa-thumbs-up"></i> Yes, Submit it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.update(this.apiUrls.changeStatus + asset.id, {}).subscribe((res: any) => {
          if (res) {
            swal.fire('Success!', '', 'success');
            this.getCount();
          } else {
            Swal.fire(
                'Error!',
                'Commits are not allowed..!.',
                'error'
            );
          }
        });
      }
    })
  }
  getAllCategory(): void{
    this.apiService.get(this.apiUrls.getAllCategories).subscribe((res: any) => {
      if (res){
        this.assetCategoryTypes = res;
      }
    })
  }
  getAllSubCategory(): void{
    this.apiService.get(this.apiUrls.getAllSubCategories + '?category=' + this.assetQuery.assetCategory).subscribe((res: any) => {
      if (res){
        this.assetSubCategoryTypes = res;
      }
    })
  }
  getSitesForDropDownExpense(): void {
    this.apiService.get(this.apiUrls.getSitesDropDownForAsset).subscribe((res: any) => {
      if (res) {
        this.sitesStore = res;
      }
    });
  }
  // toggleRowExpand(index: number): void {
  //   this.expandedRows[index] = !this.expandedRows[index];
  //
  //   // Collapse other rows when expanding a new row
  //   if (this.expandedRows[index]) {
  //     this.expandedRows = this.expandedRows.map((_, i) => i === index);
  //   }
  // }
  toggleRowExpand(index: number, rowData: any): void {
    this.assetRequisitionId = rowData.id
    this.expandedRows[index] = !this.expandedRows[index];

    // Store the selected row's data when expanding
    if (this.expandedRows[index]) {
      this.assetQuery = rowData;
      this.getById()
    } else {
      this.assetQuery = null;
    }

    // Collapse other rows when expanding a new row
    if (this.expandedRows[index]) {
      this.expandedRows = this.expandedRows.map((_, i) => i === index);
    }
  }
  getById(): void{
    this.apiService.get(this.apiUrls.getAssetById + this.assetRequisitionId).subscribe((res: any) => {
      if (res){
        this.getAllCategory()
        this.getAllSubCategory();
        this.getSitesForDropDownExpense();
        this.getCustodianDetails();
        this.assetQuery = res;
        this.initiatePo.shippingAddress = res.shippingAddress
        // this.assetQuery.custodianId = res.custodianId;
      }
    })
  }
  getStatusClass(currentStatus: string): string {
    switch (currentStatus) {
      case 'COMMITTED':
        // OM_PENDING
        return 'inactive';
      case 'APPROVED':
        return 'inactive';
      case 'SIGNED_OFF':
        return 'inactive';
        // Add more cases for other statuses as needed
      default:
        return '';
    }
  }

  getStatusCheck(id: any, status: any, nextStatus: any): any {
    if (id === this.currentUser.id && this.currentUser.role === 26) {
      if (nextStatus === 'OM_PENDING') {
        this.checkStatus.fieldBoo = true;
        this.checkStatus.staticBoo = false;
      } else {
        this.checkStatus.fieldBoo = false;
        this.checkStatus.staticBoo = true;
      }
    } else if (id === this.currentUser.id && this.currentUser.role === 31) {
      console.log('om')
      if (nextStatus === 'RM_PENDING') {
        this.checkStatus.fieldBoo = true;
        this.checkStatus.staticBoo = false;
      } else {
        this.checkStatus.fieldBoo = false;
        this.checkStatus.staticBoo = true;
      }
    } else if (id === this.currentUser.id && this.currentUser.role === 40) {
      console.log('rm')
      if (nextStatus === 'VL_PENDING') {
        console.log(123456)
        this.checkStatus.fieldBoo = true;
        this.checkStatus.staticBoo = false;
      } else {
        this.checkStatus.fieldBoo = false;
        this.checkStatus.staticBoo = true;
      }
    } else if (id === this.currentUser.id && this.currentUser.role === 76) {
      console.log('vl')
      if ((nextStatus === 'INITIATE_PO')) {
        this.checkStatus.fieldBoo = true;
        this.checkStatus.staticBoo = false;
      } else {
        this.checkStatus.staticBoo = true;
      }
    } else {
      this.checkStatus.fieldBoo = false;
      this.checkStatus.staticBoo = true;
    }
    return this.checkStatus
  }

  addPurchasingFun(asset: any) {
    this.allErrors = [];
    const combinedPayload = {
      ...this.initiatePo,
      ...this.assetQuery
    };
    this.initiatePo.proformaDate = this.datePipe.transform(this.dateOfProforma, 'yyyy-MM-dd');
    console.log(this.initiatePo.proformaDate)
    swal.fire({
      title: 'Are you sure?' ,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#d33',
      confirmButtonText: '<i class="fa fa-thumbs-up"></i> Yes, Submit it!',
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = {
          ...this.initiatePo,  // Include other properties from initiatePo
          description: this.assetQuery.description, // Include description from assetQuery
          shippingAddress: this.assetQuery.shippingAddress,
          itemsList: this.assetQuery.itemsList  // Include itemsList from assetQuery
        };
        this.apiService.update(this.apiUrls.addPurchasingOrder + asset.id, payload).subscribe((res: any) => {
          if (res){
            swal.fire('Success!', ' ' , 'success');
            this.getCount();
          } else {
            Swal.fire(
                'Error!',
                'PO_INITIATED are not allowed..!.',
                'error'
            );
          }
        }, error => {
          this.allErrors = error;
        });
      }
    })
  }
  getCustodianDetails(): void{
    console.log(this.assetQuery.siteId);
    this.apiService.get(this.apiUrls.getCustodianDetails + 'id='  + this.assetQuery.siteId).subscribe((res: any) => {
      if (res){
        this.custodianDetails = res;
        // this.assetQuery.custodianName = res[0].custodianName;
        // this.assetQuery.custodianNumber = res[0].custodianNumber;

        // console.log(this.custodianDetails)
      }
    })
  }
  onClick(event: any): void {
    this.previewUrl2 = event;
    this.imageChangedEvent = event;
    this.modalRef = this.ngModalService.open(this.myModal2, {size: 'lg', backdrop: 'static', keyboard: false});
  }


  // uploadImage(event: any): void {
  //   const reader = new FileReader();
  //   if (!event.imageData) {
  //   } else {
  //     const obj: any = {
  //       file: '',
  //       subUrl: '',
  //       picName: '',
  //     };
  //     for (let i = 0; i < this.imageArray.length; i++) {
  //       if (this.imageArray[i].picName === event.uploadName) {
  //         this.imageArray.splice(i, 1);
  //       }
  //     }
  //     console.log(this.imageArray)
  //     switch (event.uploadName) {
  //       case 'uploadAssetDocument':
  //         obj.picName = event.uploadName;
  //         obj.subUrl = 'api/v1/assetTracking/indent/uploadAssetDocument?id=';
  //         obj.file = event.imageData;
  //         reader.readAsDataURL(obj.file);
  //         console.log(obj.file)
  //         reader.onload = () => {
  //           this.uploadPanPicDemo = reader.result;
  //         };
  //         this.imageArray.push(obj);
  //         break;
  //     }
  //     console.log(this.custodianUploadData)
  //   }
  //   // this.preview();
  // }
  // uploadImage(event: any, item: any, i: number): void {
  //   // this.vendorExpenseErrors = [];
  //   const reader = new FileReader();
  //   if (!event.imageData) {
  //     Swal.fire('Error!', 'Please select File', 'error');
  //   } else if (event.uploadName) {
  //     this.imageFile.picName = event.uploadName;
  //     this.imageFile.imageData = event.imageData;
  //     // if (this.imageFile.imageData.size >= 2000000){
  //       // this.vendorExpenseErrors.push('Please Upload Image Below 2MB');
  //     // }
  //     this.imageFile.subUrl = 'api/v1/vendorPayment/uploadVendorPaymentDocument?' + '&vendorPaymentId=';
  //   }
  //   reader.readAsDataURL(event.imageData);
  //   reader.onload = () => {
  //     this.vendorExpensePicDemo = reader.result;
  //     item.imageFileArray.push({
  //       name: event.uploadName + this.currentUser.fullName, encoding: event.imageData, mimetype: 'image/png',
  //       url: this.vendorExpensePicDemo, subUrl: this.imageFile.subUrl
  //     });
  //   };
  // }


  // uploadImage(event: any, rowIndex: number): void {
  //   const reader = new FileReader();
  //   if (!event.imageData) {
  //     Swal.fire('Error!', 'Please select a file', 'error');
  //   } else if (event.uploadName) {
  //     const imageFile = {
  //       picName: event.uploadName,
  //       imageData: event.imageData,
  //       subUrl: 'api/v1/vendorPayment/uploadVendorPaymentDocument?' + '&vendorPaymentId=' // Modify this as per your application's requirements
  //     };
  //
  //     reader.readAsDataURL(event.imageData);
  //     reader.onload = () => {
  //       const imageUrl = reader.result as string;
  //       this.assetQuery.itemsList[rowIndex].imageData = imageUrl; // Update the image data for the specific row
  //       console.log('Image uploaded for row index:', rowIndex, this.assetQuery.itemsList);
  //     };
  //   }
  // }
















  imgArr: any = []
  rowArrWithIma: any = []
  uploadImageSingleWithBinary(event: any, item: any, i: number): void {
    console.log(event.imageData.name);
    const reader = new FileReader();
    let vendorExpensePicDemo: string | ArrayBuffer | null = '';
    reader.readAsDataURL(event.imageData);
    reader.onload = () => {
      vendorExpensePicDemo = reader.result;
      event.imageData.url = vendorExpensePicDemo;

      // Ensure imageFileArray is initialized as an array
      if (!item.imageFileArray) {
        item.imageFileArray = [];
      }

      // Push the event to the array
      item.imageFileArray.push(event);
      const imageCount = item.imageFileArray.length;
      this.imageCounts[i] = imageCount;
    };
    // this.allUploadedImages.push(item.imageFileArray)
    console.log(item.imageFileArray)
    // this.singleImageWithBinary(this.assetQuery);
    // console.log(JSON.stringify(item), item)

    // formData.append("acknowledgeList", JSON.stringify(formData))
    //
    // let object: any = {};
    // formData.forEach((value, key) => object[key] = value);
    // const json = JSON.stringify(object);
    // console.log(json, '===========================');

    // this.vendorExpenseErrors = [];
    // const reader = new FileReader();
    // if (!event.imageData) {
    //   Swal.fire('Error!', 'Please select File', 'error');
    // } else if (event.uploadName) {
    //   this.imageFile.picName = event.uploadName;
    //   this.imageFile.imageData = event.imageData;
    //   if (this.imageFile.imageData.size >= 2000000){
    //     // this.vendorExpenseErrors.push('Please Upload Image Below 2MB');
    //   }
    //   this.imageFile.subUrl = 'api/v1/vendorPayment/uploadVendorPaymentDocument?' + '&vendorPaymentId=';
    // }
    // reader.readAsDataURL(event.imageData);
    // reader.onload = () => {
    //   this.vendorExpensePicDemo = reader.result;
    //   this.imageFileArray.push({
    //     name: event.uploadName + this.currentUser.fullName, encoding: event.imageData, mimetype: 'image/png',
    //     url: this.vendorExpensePicDemo, subUrl: this.imageFile.subUrl
    //   });
    //   console.log(this.imageFileArray, 'this.imageFileArraythis.imageFileArraythis.imageFileArraythis.imageFileArray=========', item)
    // };
  }

  ackUpload(): void{
    // this.imageArray = [];
    // this.custodianUploadData.invoiceNumber = '';
    // this.custodianUploadData.qty= ''
    // this.uploadPanPicDemo = ''
    this.apiService.get(this.apiUrls.addCustodianQtyAndInvoiceNumber
        + this.assetRequisitionId
        +  '&qty=' + this.custodianUploadData.qty
        + '&invoiceNumber=' + this.custodianUploadData.invoiceNumber).subscribe((res: any) => {
          if (res){
            let i: any;
            for (i = 0; i < this.imageArray.length; i++) {
              console.log(this.imageArray, '================')
              this.apiService.imageUpload(this.imageArray[i].subUrl
                  + this.assetRequisitionId
                  +  '&qty=' + this.custodianUploadData.qty,
                  // + '&invoiceNumber=' + this.custodianUploadData.invoiceNumber,
                  this.imageArray[i].file).subscribe
              ((response: any) => {
                if (response) {
                  if (i === this.imageArray.length) {
                    console.log(this.imageArray, '==========image Array');
                    swal.fire('Success!', 'Acknowledged Successfully  ' , 'success');
                    this.getCount();
                    this.ngModalService.dismissAll();
                    this.router.navigate(['AssetTracking/assetRequisitionForm']);
                  }
                }
              },error => {
                console.log(error)
                swal.fire('Error!', error, 'error');
                  });
            }
          }
    }, error => {
      swal.fire('Error!', error[0], 'error');
    })
  }


// singleImageWithBinary(): void{
//   const imageAray: any = [];
//   if (this.imageFileArray.length != 0) {
//     for (let i = 0; i < this.imageFileArray.length; i++) {
//       imageAray.push(this.imageFileArray[i].encoding);
//       console.log(imageAray, '---------------------')
//     }
//     console.log(imageAray.length, '--------------------->>>>>>>>>>>>>>>>>>>>>>>>>>')
//     this.apiService.imageUploadBinary(this.apiUrls.imageUploadForAck + '12345', imageAray).subscribe((res: any) => {
//     })
//   }
// }
singleImageWithBinary2(): void{
  const formData = new FormData();
  const imageAray: any = [];
  if (this.imageFileArray.length != 0) {
    for (let i = 0; i < this.imageFileArray.length; i++) {
      // formData.append('data' + i, this.imageFileArray[i].encoding);
      console.log(this.imageFileArray[i].encoding, formData)
      this.apiService.imageUploadBinary(this.apiUrls.imageUploadForAck + '12345', this.imageFileArray[i].encoding).subscribe((res: any) => {
      })
    }
    // console.log(imageAray, '--------------------->>>>>>>>>>>>>>>>>>>>>>>>>>')

  }
}

  singleImageWithBinary(data: any) {
    // const payload: any = {acknowledgeList: []};
    // for (let i of this.assetQuery.itemsList) {
    //   let obj = {
    //     serialNumber: i.serialNumber,
    //     request: i.imageFileArray
    //     // request: []
    //   }
    //   // obj.request = i.imageFileArray.map((j: any) => {
    //   //   return this.apiService.base64ToBinary(j.url);
    //   // })
    //   payload.acknowledgeList.push(obj)
    // }
    // console.log(payload)

    const formData = new FormData();
    let totalReceivedQuantity = 0;
    this.assetQuery.itemsList.forEach((item: any, index: number) => {
      formData.append(`acknowledgeList[${index}].serialNumber`, item.serialNumber.toString());
      const remarks = item.remarks ? item.remarks : '';
      formData.append(`acknowledgeList[${index}].remarks`, remarks);
      // const receivedQuantity = item.receivedQuantity ? item.receivedQuantity : '0';
      // formData.append(`acknowledgeList[${index}].receivedQuantity`, receivedQuantity);
      // formData.append(`acknowledgeList[${index}].totalAmount`, item.totalAmount.toString());
      const receivedQuantity = item.receivedQuantity ? item.receivedQuantity : '0';
      formData.append(`acknowledgeList[${index}].receivedQuantity`, receivedQuantity);

      if (!item.imageFileArray) {
        item.imageFileArray = [];
      }
      // Add to totalReceivedQuantity
      totalReceivedQuantity += parseInt(receivedQuantity, 10);
      console.log(totalReceivedQuantity, item.imageFileArray);
      item.imageFileArray.forEach((fileItem: any, fileIndex: number) => {
        // console.log(fileItem.imageData.name, '----------=============>>>>>>>>>>>>>>>>==============================')

        if (fileItem?.imageData?.name) {
          formData.append(`acknowledgeList[${index}].imageFileArray[${fileIndex}].imageData`, fileItem.imageData);
          // formData.append(`acknowledgeList[${index}].imageFileArray[${fileIndex}].uploadName`, fileItem.uploadName);
        }
        // formData.append(`acknowledgeList[${index}].imageFileArray[${fileIndex}].imageData`, fileItem.imageData);
      });
    });
    console.log(formData,'---------------->>>>>>>>>>>>>>>>>>>')
    let object: any = {};
    formData.forEach((value, key) => object[key] = value);
    const jsonData = JSON.stringify(object);
    console.log(jsonData, '===========================');
    this.apiService.imageUpload123(this.apiUrls.imageUploadForAck + data.id + '&qty=' + totalReceivedQuantity, formData ).subscribe((res: any) => {
      if (res){
        console.log(res)
        swal.fire('Success', 'Uploaded Successfully.', 'success');
        this.changeTab(1)
      }
    }, error => {
      console.log(error);
      let errorMessage: string = '';
      if (Array.isArray(error)) {
        errorMessage = '<ul>'; // Start unordered list
        error.forEach(message => {
          errorMessage += `<li style="text-align: start; color: red">${message}</li>`; // Add each error message as a list item
        });
        errorMessage += '</ul>'; // End unordered list
      } else {
        errorMessage = error.toString(); // Convert non-array errors to string
      }
      Swal.fire('Error!', errorMessage, 'error');
    })
  }

  ViewImages(item: any, n: number): void{
    this.allUploadedImagesNumber = n
    console.log(this.allUploadedImagesNumber, '===============================')
    this.getImagesPathAndNameForArray(item, n)
    this.modalRef = this.ngModalService.open(this.viewImageModal, {size: 'lg', backdrop: 'static', keyboard: false});
  }

  deleteImage(imageIndex: number): void {
    const currentItem = this.assetQuery.itemsList[this.allUploadedImagesNumber];
    currentItem.imageFileArray.splice(imageIndex, 1);
    this.imageCounts[this.allUploadedImagesNumber] = currentItem.imageFileArray.length;
    console.log(currentItem.imageFileArray);
  }
  selectedRowIndex: number | null = null;
  getImagesPathAndNameForArray(item: any, index: number): void{
    this.apiService.get(this.apiUrls.getAcknowledgeListImagesBySerialNumber + this.assetQuery.id + '&serialNumber=' + item.serialNumber).subscribe((res: any) => {
      if (res){
        console.log(res);
        this.imagesPathById = res;
        this.assetQuery.itemsList[this.allUploadedImagesNumber].imageFileArray.push(...this.imagesPathById);
        this.selectedRowIndex = index;
        console.log(this.selectedRowIndex)
;      }
    })
  }

  downloadImage(url: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = this.extractFilename(url);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  extractFilename(url: string): string {
    return url.substring(url.lastIndexOf('/') + 1);
  }
  // getUrlsByPath(path: any): void{
  //   console.log(path);
  //   this.apiService.get(this.apiUrls.getUrlByFilePath + path.filePath ).subscribe((res: any) => {
  //     if(res){
  //       console.log(res.url);
  //       this.downloadImage(res.url);
  //     }
  //   })
  // }

  downloadImage1(url: any): void {
    const a = document.createElement('a');
    a.href = url;

    // Check if url is defined
    if (url) {
      const segments = url.split('/');
      const filename = segments.pop(); // Extract filename from URL
      if (filename) {
        a.download = filename;
      } else {
        console.error('Unable to extract filename from URL:', url);
        return; // Don't proceed further if filename is undefined
      }
    } else {
      console.error('URL is undefined.');
      return; // Don't proceed further if URL is undefined
    }

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // acknowledgeOpenPopUp(data: any) {
  //   const acknowledgeList = [];
  //
  //   for (const item of this.assetQuery.itemsList) {
  //     const request = [];
  //
  //     // Assuming item.imageFileArray contains File objects
  //     for (const imageFile of item.imageFileArray) {
  //       request.push(imageFile); // Append each image File to the request array
  //     }
  //
  //     const acknowledgeItem = {
  //       serialNumber: item.serialNumber,
  //       receivedQuantity: 2, // Modify this as needed
  //       request: request,
  //       remarks: "" // Add remarks if needed
  //     };
  //
  //     acknowledgeList.push(acknowledgeItem);
  //   }
  //
  //   const payload: any = {
  //     acknowledgeList: acknowledgeList
  //   };
  //
  //   console.log("Payload:", payload); // Log the payload to verify its structure
  //
  //   // Now you can send the payload to your API endpoint
  //   this.apiService.imageUpload123(this.apiUrls.imageUploadForAck + data.id + '&qty='+ 2, payload).subscribe(
  //       (res: any) => {
  //         console.log('Response:', res); // Handle response as needed
  //       },
  //       (error) => {
  //         console.error('Error:', error); // Log any errors
  //       }
  //   );
  // }








  acknowledgeOpenPopUp1(data: any) {
    const payload: any = { acknowledgeList: [] };

    for (let i of this.assetQuery.itemsList) {
      let obj = {
        serialNumber: i.serialNumber,
        request: []
      };

      if (i.imageFileArray && i.imageFileArray.length > 0) {
        i.imageFileArray.forEach((imageFile: any) => {
          // Assuming imageFile.url contains the base64 string
          const byteCharacters = atob(imageFile.url.split(',')[1]);
          const byteNumbers = new Array(byteCharacters.length);
          for (let j = 0; j < byteCharacters.length; j++) {
            byteNumbers[j] = byteCharacters.charCodeAt(j);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const file = new File([byteArray], `image_${Date.now()}.png`, { type: 'image/png' });
          // @ts-ignore
          obj.request.push(file);
        });
      }

      payload.acknowledgeList.push(obj);
    }

    console.log(payload);

    // Assuming this.Apiurls.mainUrl is your API base URL
    // and this.apiUrls.imageUploadForAck + data.id forms the specific endpoint
    const subUrl = this.apiUrls.imageUploadForAck + data.id;
    const files = payload.acknowledgeList.map((obj: any) => obj.request).flat(); // Extract all files

    // Call the imageUpload method for each file
    files.forEach((file: any) => {
      this.apiService.imageUpload(subUrl, file).subscribe((res: any) => {
        // Handle response
      });
    });
  }
  close(): void{
    this.ngModalService.dismissAll();
    this.imageArray = [];
    this.custodianUploadData.invoiceNumber = '';
    this.custodianUploadData.qty= ''
    this.imagesPathById= []
    // this.assetQuery.itemsList[this.allUploadedImagesNumber].imageFileArray = [];
  }
  getVendorPanDetail(): void {
    if (this.initiatePo.panCardNumber.length === 10) {
      this.apiService.get(this.apiUrls.getVendorDetailsByPan  + this.initiatePo.panCardNumber)
          .subscribe((res: any) => {
            if (res) {
              this.initiatePo = res;
              this.initiatePo.additionalExpenses = 0;
              // this.initiatePo.rate = 0;
              // this.initiatePo.gstAmount = 0;
              // this.initiatePo.totalAmount = 0;

              this.assetQuery.itemsList.forEach((item: any) => {
                item.rate = 0;
                item.gstAmount = 0;
                item.preGstAmount = 0;
                item.totalAmount = 0;
                // Reset other properties here if needed
              });
              this.initiatePo.shippingAddress =this.assetQuery.shippingAddress
              this.initiatePo.billingAddress = '8th floor,801/A,krishe Block 1-89/3/B/40-42/KS/801A, Krishe Sapphire, Hi-Tech City Road, Madhapur, Hyderabad, Ranagareddy,500081,India,PAN Number: AABCZ2432M,GSTIN 36AABCZ2432M1Z4'
            }
          });
    }
  }
  rejectAsset(asset: any): void {
    swal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#d33',
      confirmButtonText: '<i class="fa fa-thumbs-up"></i> Yes, Reject it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.update(this.apiUrls.rejectRequestForm + asset.id, {}).subscribe((res: any) => {
          if (res) {
            swal.fire('Rejected', 'Your request has been rejected.', 'success');
            this.getCount()
          } else {
            Swal.fire(
                'Error!',
                'Reject are not allowed..!.',
                'error'
            )
          }
        })
      }
    })
  }

  showRejectButtonFun(asset: any): any {
    if (this.currentUser.id === asset.createdBy) {
      return false;
    } else if ((this.currentUser.role === 26) && ((asset.status === 'OM_PENDING') || (asset.status === 'RM_PENDING') || (asset.status === 'VL_PENDING') || (asset.status === 'SIGNED_OFF'))) {
      return true;
    } else if ((this.currentUser.role === 31) && ((asset.status === 'OM_PENDING'))) {
      return true;
    } else if ((this.currentUser.role === 40) && ((asset.status === 'RM_PENDING'))) {
      return true;
    } else if ((this.currentUser.role === 76) && (asset.status === 'VL_PENDING')) {
      return true;
    } else {
      return false;
    }
  }
  // @ts-ignore
  statusRole(key: any): number {
    if (key === 'OM_PENDING') {
      return 30;
    } else if (key === 'RM_PENDING') {
      return 35;
    } else if (key === 'VL_PENDING') {
      return 76;
    }
  }

  calculatePreGstAmountByItem(item: any) {
    item.preGstAmount = item.quantity * item.rate;
    this.calculateTotalAmountByItem(item)
  }
  calculateTotalAmountByItem(item: any) {
    // Calculate total amount
    item.totalAmount = item.preGstAmount + item.gstAmount;
    this.totalFun(item)
  }
  totalFun(data: any) {
    this.assetQuery.itemsList
    console.log(this.assetQuery.itemsList)
    let totalAmount = 0;
    this.assetQuery.itemsList.forEach((item: any) => {
      totalAmount += item.totalAmount;
    });
    this.initiatePo.totalAmount = totalAmount;
    let totalWithExpenses = totalAmount + this.initiatePo.additionalExpenses;

    // Update initiatePo.totalAmount with the total amount including additional expenses
    this.initiatePo.totalAmount = totalWithExpenses;
    console.log(totalAmount, '==========', this.initiatePo.totalAmount)
  }
  calculatePreGstAmount(): void{
    this.initiatePo.preGstAmount = Number(this.assetQuery.quantity) * Number(this.initiatePo.rate);
  }
  calculateTotalAmount(): void{
    this.initiatePo.totalAmount = Number (this.initiatePo.preGstAmount) + Number(this.initiatePo.gstAmount)  + Number(this.initiatePo.additionalExpenses)
  }


  pdfData(): void{
    this.apiService.get(this.apiUrls.getPoGenerated + this.assetRequisitionId).subscribe((res: any) => {
      if (res){
        this.pdfDownload(res);
      }
    })
  }
  pdfDownload(data: any): void {
    console.log(data)
    let today = new Date();
    let day = String(today.getDate()).padStart(2, '0');
    let month = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
    let year = today.getFullYear();
// Get the time components
    let hours = String(today.getHours()).padStart(2, '0');
    let minutes = String(today.getMinutes()).padStart(2, '0');

// Format the date and time with hyphen between hours and minutes
    let formattedDateTime = `${day}-${month}-${year}: ${hours}:${minutes}`;
    if (data) {
      this.poData = data;
      const elementToPrint = document.getElementById('pdfTable'); // The html element to become a pdf
      const opt = {
        margin: 0.5,
        filename: this.currentUser.fullName +'_'+formattedDateTime + '_' + 'PO'+  '.pdf',
        image: {type: 'jpeg', quality: 0.20},
        html2canvas: {
          quality: 1,
          dpi: 192,
          scale: 2,
          allowTaint: true,
          useCORS: true,
          logging: false,
          scrollX: 0,
          scrollY: 0,
          backgroundColor: '#ffffff'
        },
        // pagebreak: {mode: 'avoid-all', before: '#QRImage'},
        jsPDF: {unit: 'cm', format: 'a4', orientation: 'portrait'}
      };
      html2pdf().from(elementToPrint).set(opt).save();
    }
  }

  convertImageToUrl(data: any): string {
    console.log(data, '-----------------------')
    let picDemo: string | ArrayBuffer | null = ''
    const reader = new FileReader();
    reader.readAsDataURL(data);
    reader.onload = () => {
      picDemo = reader.result;
    }
    console.log(picDemo, '==================================')
    return picDemo
  }
}
