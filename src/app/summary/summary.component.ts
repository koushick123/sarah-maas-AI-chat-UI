import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// PrimeNG modules (add more as needed)
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { CommonModule } from '@angular/common';
import { RadioButtonModule } from 'primeng/radiobutton';
import { Dialog } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { ScrollTopModule } from 'primeng/scrolltop';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-summary',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    FormsModule,
    HttpClientModule,
    ButtonModule,
    SelectModule,
    CommonModule,
    // CardModule,
    TextareaModule,
    RadioButtonModule,
    Dialog,
    ProgressSpinnerModule,
    MessageModule,
    ScrollTopModule,
    ToastModule,
    ConfirmDialogModule
  ],
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})

export class SummaryComponent {
  books = [
    { label: 'Select a Book', value: null },
    { label: 'Crescent City - House of Earth and Blood', value: 'Crescent-City-Book-1' },
    { label: 'Crescent City - House of Sky and Breath', value: 'Crescent-City-Book-2' },
    { label: 'Crescent City - House of Flame and Shadow', value: 'Crescent-City-Book-3' }
  ];

  chapters: any[] = [];
  parts: any[] = [];
  selectedBook: string | null = null;
  selectedChapter: string | null = null;
  summaryoption: string = '';
  chapterContent: string = '';
  displayDialog: boolean = false;
  part_chapter_map: Map<string, string[]> = new Map();
  selectedPart: string | null = '';
  summary1value: string = '';
  summary2value: string = '';
  summary3value: string = '';
  fetchedsummary: boolean = false;
  BASE_URL: string = 'http://localhost:9000';
  generatesummary: boolean = false;
  doc_id_summary_1: string = "-1";
  doc_id_summary_2: string = "-1";
  doc_id_summary_3: string = "-1";
  dataFetchSummary: boolean = false;
  dataFetchForPart: boolean = false;
  dataFetchForChapter: boolean = false;
  url: string = '';
  summary_request_payload: any = '';
  generatesummarydisable: boolean = false;
  savesummarydisable: boolean = false;
  generateSummary1Clicked: boolean = false;
  generateSummary2Clicked: boolean = false;
  generateSummary3Clicked: boolean = false;
  askSummarySave: boolean = false;
  askSummaryVisibility: boolean = false;
  previousChapter: string | null = null;
  previousPart: string | null = null;
  previousBook: string | null = null;

  constructor(private http: HttpClient, private messageService: MessageService, private confirmationService: ConfirmationService) { }

  onBookChange(newBookValue: string) {
    if (newBookValue) {
      if(this.selectedBook){
        this.previousBook = this.selectedBook;
      }
      else{
        //Applicable only for the first time
        this.previousBook = newBookValue;
      }
      this.selectedBook = newBookValue;
      console.log('Previous Book = '+this.previousBook);
      console.log('New Book = '+this.selectedBook);
      if(this.hasAnySummaryBeenUpdated()){
        this.showConfirmDialog(SELECTION_LEVEL.BOOK);
      }
      else{
        this.resetSummariesAndPartsAndFetchChapterNames();
      }
    } else {
      this.chapters = [];
    }
  }

  resetSummariesAndPartsAndFetchChapterNames(){
    this.resetGenerateSummaryFlags();
    this.selectedChapter = null;
    this.selectedPart = '';
    this.summaryoption = '';
    this.generatesummary = false;
    this.resetSummaries();
    this.fetchChapterNames();
  }

  //Call this for change in book or part, do ensure all summaries are being refreshed.
  resetSummaries() {
    this.summary1value = '';
    this.summary2value = '';
    this.summary3value = '';
    this.summary1empty = true;
    this.summary2empty = true;
    this.summary3empty = true;
    this.doc_id_summary_1 = "-1";
    this.doc_id_summary_2 = "-1";
    this.doc_id_summary_3 = "-1";
  }

  summary1empty: boolean = true;
  summary2empty: boolean = true;
  summary3empty: boolean = true;

  selectSummaryOption(selectedSummaryOption: string) {

    console.log('Summary option = '+this.summaryoption);
    console.log('Summary 1 = '+this.summary1empty+" , Value = "+this.summary1value);
    console.log('Summary 2 = '+this.summary2empty+" , Value = "+this.summary2value);
    console.log('Summary 3 = '+this.summary3empty+" , Value = "+this.summary3value);

    this.summaryoption = selectedSummaryOption;
    this.generatesummary = true;
    this.summary_request_payload = {
      "book_name": this.selectedBook,
      "part": this.selectedPart,
      "chapter_name": this.selectedChapter,
      "chapter_summary": '',
      "summary_option": this.summaryoption,
      "doc_id": -1
    };

    if (this.summaryoption == 'summary1') {
      const summaryNotFound: string = 'No chapter summaries found.';
      if (this.summary1value == '' || this.summary1value == summaryNotFound) {
        //To enable spinner to be shown
        this.summary1value = '';
        this.summary_request_payload['doc_id'] = this.doc_id_summary_1;
        this.fetchSavedSummary(this.summary_request_payload);
      }
      else {
        console.log('Doc id for summary 1 - ' + this.doc_id_summary_1);
      }
    }
    else if (this.summaryoption == 'summary2') {
      const summaryNotFound: string = 'No chapter summaries found.';
      if (this.summary2value == '' || this.summary2value == summaryNotFound) {
        //To enable spinner to be shown
        this.summary2value = '';
        this.summary_request_payload['doc_id'] = this.doc_id_summary_2;
        this.fetchSavedSummary(this.summary_request_payload);
      }
      else {
        console.log('Doc id for summary 2 - ' + this.doc_id_summary_2);
      }
    }
    else {
      //For Summary 3 , we need to display all summaries.
      if(this.summary1empty && this.summary2empty && this.summary3empty){
        this.fetchAllSummaries(this.summary_request_payload);
      }
      else{
        if (this.summary1empty) {
          this.summary1value = '';
          this.summary_request_payload['doc_id'] = this.doc_id_summary_1;
          this.summary_request_payload['summary_option'] = 'summary1';
          this.fetchSavedSummary(this.summary_request_payload);
        }
        
        if(this.summary2empty){
          this.summary2value = '';
          this.summary_request_payload['doc_id'] = this.doc_id_summary_2;
          this.summary_request_payload['summary_option'] = 'summary2';
          this.fetchSavedSummary(this.summary_request_payload);
        }
        
        if(this.summary3empty){
            //To enable spinner to be shown
            this.summary3value = '';
            this.summary_request_payload['doc_id'] = this.doc_id_summary_3;
            this.summary_request_payload['summary_option'] = 'summary3';
            this.fetchSavedSummary(this.summary_request_payload);
          }
      }
    }
  }

  originaloption: string = '';

  fetchAllSummaries(summary_request_payload: any) {
    this.originaloption = this.summaryoption;

    //Fetch summary 1    
    summary_request_payload['summary_option'] = 'summary1';
    summary_request_payload['doc_id'] = this.doc_id_summary_1;
    this.summaryoption = 'summary1';
    this.summary_display_text = 'Summary 1';
    this.generatesummarydisable = true;

    this.http.post<any>(this.BASE_URL + '/chapter/summaries', summary_request_payload)
      .subscribe({
        next: (summary) => {
          this.summary1value = summary['summary'];
          this.doc_id_summary_1 = summary['doc_id']
          this.summary1empty = (this.doc_id_summary_1 == "-1" ? true : false);
          console.log('Summary 1 :', summary);

          //Fetch summary 2 
          summary_request_payload['doc_id'] = this.doc_id_summary_2;
          summary_request_payload['summary_option'] = 'summary2';
          this.summaryoption = 'summary2';
          this.summary_display_text = 'Summary 2';

          this.http.post<any>(this.BASE_URL + '/chapter/summaries', summary_request_payload)
            .subscribe({
              next: (summary) => {
                this.summary2value = summary['summary'];
                this.doc_id_summary_2 = summary['doc_id']
                this.summary2empty = (this.doc_id_summary_2 == "-1" ? true : false);
                console.log('Summary 2 :', summary);

                //Fetch summary 3
                summary_request_payload['doc_id'] = this.doc_id_summary_3;
                summary_request_payload['summary_option'] = 'summary3';
                this.summaryoption = 'summary3';
                this.summary_display_text = 'Summary 3';

                this.http.post<any>(this.BASE_URL + '/chapter/summaries', summary_request_payload)
                  .subscribe({
                    next: (summary) => {
                      this.summary3value = summary['summary'];
                      this.summary3empty = (this.doc_id_summary_3 == "-1" ? true : false);
                      console.log('Summary 3 :', summary);
                    },
                    error: (err) => {
                      console.error('Error summary 3 :', err)
                      this.summary3value = err;
                      this.showErrorMessage("There was an error loading the Chapter's Summary 3. Please try again later.",3000);
                    }
                  });
              },
              error: (err) => {
                console.error('Error summary 2 :', err)
                this.summary2value = err;
                this.showErrorMessage("There was an error loading the Chapter's Summary 2. Please try again later.",3000);
              }
            });
          this.summaryoption = this.originaloption;
          this.generatesummarydisable = false;
          console.log('Restore original option = ' + this.originaloption);
        },
        error: (err) => {
          console.error('Error:', err)
          if (this.summaryoption == 'summary1') {
            this.summary1value = err;
          }
          else if (this.summaryoption == 'summary2') {
            this.summary2value = err;
          }
          else {
            this.summary3value = err;
          }
          this.summaryoption = this.originaloption;
          this.generatesummarydisable = false;
          this.showErrorMessage("There was an error loading the Chapter's Summary 1. Please try again later.",3000);
        }
      });
  }

  fetchSavedSummary(summary_request_payload: any) {
    console.log('Fetch summary for summary_request_payload = ' + JSON.stringify(summary_request_payload));
    this.generatesummarydisable = true;
    this.savesummarydisable = true;
    this.http.post<any>(this.BASE_URL + '/chapter/summaries', summary_request_payload)
      .subscribe({
        next: (summary) => {
          if (this.summaryoption == 'summary1') {
            this.summary1value = summary['summary'];
            this.doc_id_summary_1 = summary['doc_id'];
            this.summary1empty = (this.doc_id_summary_1 == "-1" ? true : false);
            console.log('Doc id Updated to :', this.doc_id_summary_1);
          }
          else if (this.summaryoption == 'summary2') {
            this.summary2value = summary['summary'];
            this.doc_id_summary_2 = summary['doc_id'];
            this.summary2empty = (this.doc_id_summary_2 == "-1" ? true : false);
            console.log('Doc id Updated to :', this.doc_id_summary_2);
          }
          else {
            this.summary3value = summary['summary'];
            this.doc_id_summary_3 = summary['doc_id'];
            this.summary3empty = (this.doc_id_summary_3 == "-1" ? true : false);
            console.log('Doc id Updated to :', this.doc_id_summary_3);
          }

          this.generatesummarydisable = false;
          this.savesummarydisable = false;

        },
        error: (err) => {
          console.error('Error:', err)
          this.generatesummarydisable = false;
          if (this.summaryoption == 'summary1') {
            this.summary1value = err;
          }
          else if (this.summaryoption == 'summary2') {
            this.summary2value = err;
          }
          else {
            this.summary3value = err;
          }
        }
      });
  }

  fetchChapterContent() {
    this.displayDialog = true;
    this.chapterContent = '';
    this.showChapterContent();
  }

  selChapterWithHyphen: string | null = ''

  showChapterContent() {
    if (this.selectedChapter) {
      this.dataFetchForChapter = false;
      this.selChapterWithHyphen = this.selectedChapter;
      this.url = this.BASE_URL + '/book/' + this.selectedBook + '/chapter/' + this.selChapterWithHyphen.replace(" ", "-") + '/contents';
      console.log(this.url);
      this.http.get<string>(this.url)
        .subscribe({
          next: (data) => {
            this.dataFetchForChapter = true;
            this.chapterContent = data;
          },
          error: (err) => {
            this.dataFetchForChapter = true;
            this.chapterContent = '';
            this.showErrorMessage("There was an error fetching Summary. Please try again later.",3000);
          }
        });
    }
  }

  updateChapterContentOnChapterChange(){
    if (this.selectedChapter) {
    this.selChapterWithHyphen = this.selectedChapter;
    this.url = this.BASE_URL + '/book/' + this.selectedBook + '/chapter/' + this.selChapterWithHyphen.replace(" ", "-") + '/contents';
      console.log(this.url);
      this.http.get<string>(this.url)
        .subscribe({
          next: (data) => {
            this.chapterContent = data;
          },
          error: (err) => {
            this.chapterContent = '';
            this.showErrorMessage("There was an error fetching Summary. Please try again later.",3000);
          }
        });
      }
  }

  onHideDialog() {
    this.displayDialog = false;
    console.log(this.selectedChapter);
  }

  fetchChapterNames() {
    this.dataFetchForPart = true;
    this.http.get<Map<string, string[]>>(this.BASE_URL + '/book/' + this.selectedBook + '/chapters')
      .subscribe({
        next: (data) => {
          const sortedEntries = Object.entries(data).sort(([a], [b]) => a.localeCompare(b));
          this.part_chapter_map = new Map<string, string[]>(sortedEntries);

          // Parts list
          this.parts = Array.from(this.part_chapter_map.keys());
          this.dataFetchForPart = false;
        },
        error: (err) => {
          console.error('Error fetching chapters:', err);
          this.dataFetchForPart = false;
          this.showErrorMessage("There was an error loading the Chapters. Please try again later.",3000);
        }
      });
  }

  fetchChapterFromPart(newPartValue: any) {
    this.previousPart = this.selectedPart;
    console.log('New Part = '+newPartValue);
    console.log('Previous Part = '+this.previousPart);
    this.selectedPart = newPartValue;

    //Check if user has cliked on Generate Summary for any option and if yes ask if he wants to save the changes before changing to another chapter
    if (this.hasAnySummaryBeenUpdated()) {
      this.showConfirmDialog(SELECTION_LEVEL.PART);
    }
    else {
      this.resetSummariesAndUpdateChapterList();
    }
  }

  hasAnySummaryBeenUpdated(){
    return (this.generateSummary1Clicked || this.generateSummary2Clicked || this.generateSummary3Clicked);
  }

  resetSummariesAndUpdateChapterList(){
    this.resetGenerateSummaryFlags();
    this.selectedChapter = null;
      this.summaryoption = '';
      this.generatesummary = false;
      this.resetSummaries();

      if (this.selectedPart && typeof (this.part_chapter_map.get(this.selectedPart)) != 'undefined') {
        const chaptersList = this.part_chapter_map.get(this.selectedPart);
        if (chaptersList) {
          this.chapters = chaptersList.map(chapter => ({
            label: chapter,
            value: chapter
          }));
        }
      }
  }

  //This method will be called only for the first time when Chapter dropdown has not been selected.
  //This is to ensure that previousChapter has been initialized correctly.
  selectChapter(){
    if (this.selectedChapter) {
      this.selChapterWithHyphen = this.selectedChapter;
      this.url = this.BASE_URL + '/book/' + this.selectedBook + '/chapter/' + this.selChapterWithHyphen.replace(" ", "-") + '/contents';
        console.log(this.url);
        this.http.get<string>(this.url)
          .subscribe({
            next: (data) => {
              this.chapterContent = data;
              this.previousChapter = this.selectedChapter;
              console.log("this.previousChapter = "+this.previousChapter);    
            },
            error: (err) => {
              this.chapterContent = '';
              this.showErrorMessage("There was an error fetching Chapter contents. Please try again later.",3000);
            }
          });
      }
  }

  updateSummaryOnChapterChange(newChapterValue: string) {
    
    if (newChapterValue && this.selectedChapter != newChapterValue) {
      this.selChapterWithHyphen = newChapterValue;
      this.url = this.BASE_URL + '/book/' + this.selectedBook + '/chapter/' + this.selChapterWithHyphen.replace(" ", "-") + '/contents';
        console.log(this.url);
        this.http.get<string>(this.url)
          .subscribe({
            next: (data) => {
              this.chapterContent = data;
              
              this.previousChapter = this.selectedChapter;
              console.log('Previous Chapter = '+this.selectedChapter);
              this.selectedChapter = newChapterValue;
              console.log('New Chapter = '+this.selectedChapter);    
              

              if (this.summaryoption != '') {
                //Check if user has cliked on Generate Summary for any option and if yes ask if he wants to save the changes before changing to another chapter
                if (this.hasAnySummaryBeenUpdated()) {
                  this.showConfirmDialog(SELECTION_LEVEL.CHAPTER);
                }
                else{
                  this.resetSummary();
                }
              }
            },
            error: (err) => {
              this.chapterContent = '';
              this.showErrorMessage("There was an error fetching Chapter contents. Please try again later.",3000);
            }
          });
    }
    
  }
 
  updateChapter(newValue: any) {
    if (this.selectedChapter && this.previousChapter != newValue) {
      this.selChapterWithHyphen = this.selectedChapter;
      this.url = this.BASE_URL + '/book/' + this.selectedBook + '/chapter/' + this.selChapterWithHyphen.replace(" ", "-") + '/contents';
        console.log(this.url);
        this.http.get<string>(this.url)
          .subscribe({
            next: (data) => {
              this.chapterContent = data;
              this.previousChapter = this.selectedChapter;
              this.selectedChapter = newValue;
              console.log('New Chapter = '+this.selectedChapter);
            },
            error: (err) => {
              this.chapterContent = '';
              this.showErrorMessage("There was an error fetching Chapter contents. Please try again later.",3000);
            }
          });
      }
  }

  resetGenerateSummaryFlags(){
    //Reset generateSummaryClicked flag and hide dialog
    this.generateSummary1Clicked = false;
    this.generateSummary2Clicked = false;
    this.generateSummary3Clicked = false;
  }

  resetSummary() {
    this.previousChapter = this.selectedChapter;
    this.resetGenerateSummaryFlags();
    // Update the summary for chapter change
    const summary_request_payload = {
      "book_name": this.selectedBook,
      "part": this.selectedPart,
      "chapter_name": this.selectedChapter,
      "chapter_summary": '',
      "summary_option": this.summaryoption,
      "doc_id": "-1"
    };
    this.resetSummaries();
    if (this.summaryoption == 'summary3') {
      this.fetchAllSummaries(summary_request_payload);
    }
    else {
      this.fetchSavedSummary(summary_request_payload);
    }
  }

  summary_display_text = '';

  generateSummary() {
    // Proceed to generate summary 3 only if summary 1 and summary 2 are present
    if (this.summaryoption == 'summary3') {
      const summaryNotFound: string = 'No chapter summaries found.';
      if ((this.summary1value == '' || this.summary1value == summaryNotFound) ||
        (this.summary2value == '' || this.summary2value == summaryNotFound)) {
        this.showErrorMessage('Either Summary 1 or Summary 2 or both are empty. Please generate their summaries.', 3000);
        return;
      }
    }

    //Flag to track that user clicked on Generate Summary button as per Summary option
    if(this.summaryoption == 'summary1'){
      this.generateSummary1Clicked = true;
    }
    else if(this.summaryoption == 'summary2'){
      this.generateSummary2Clicked = true;
    }
    else{
      this.generateSummary3Clicked = true;
    }

    if (this.selectedChapter) {
      this.selectedChapter = this.selectedChapter.replace(" ", "-");
    }

    this.fetchSummaryFromAI();
    
  }

  fetchSummaryFromAI(){
    const summary_request_payload = {
      "book_name": this.selectedBook,
      "part": this.selectedPart,
      "chapter_name": this.selectedChapter,
      "chapter_content": this.chapterContent,
      "summary_option": this.summaryoption
    };

    if (this.selectedChapter) {
      this.selectedChapter = this.selectedChapter.replace("-", " ");
    }

    this.generatesummarydisable = true;
    this.savesummarydisable = true;
    this.generatesummary = true;
    if (this.summaryoption == 'summary1') {
      this.summary1value = '';
      this.summary_display_text = 'Summary 1';
      this.summary1empty = true;
    }
    else if (this.summaryoption == 'summary2') {
      this.summary2value = '';
      this.summary_display_text = 'Summary 2';
      this.summary2empty = true;
    }
    else {
      this.summary3value = '';
      this.summary_display_text = 'Summary 3';
      this.summary3empty = true;
    }
    console.log('summary_request_payload for fetch summary from AI = '+summary_request_payload['chapter_content'].substring(0,20))
    this.http.post<string>(this.BASE_URL + '/chapter/summary', summary_request_payload)
      .subscribe({
        next: (summary) => {
          if (this.summaryoption == 'summary1') {
            this.summary1value = summary;
            this.summary1empty = false;
          }
          else if (this.summaryoption == 'summary2') {
            this.summary2value = summary;
            this.summary2empty = false;
          }
          else {
            this.summary3value = summary;
            this.summary3empty = true;
          }
          if (this.selectedChapter) {
            this.selectedChapter = this.selectedChapter.replace("-", " ");
          }
          this.generatesummarydisable = false;
          this.savesummarydisable = false;
        },
        error: (err) => {
          console.error('Genrate Summary Error :', err);
          this.generatesummarydisable = false;
          if (this.summaryoption == 'summary1') {
            this.summary1value = this.errorMessage;
          }
          else if (this.summaryoption == 'summary2') {
            this.summary2value = this.errorMessage;
          }
          else {
            this.summary3value = this.errorMessage;
          }

          this.generatesummarydisable = false;
          this.savesummarydisable = false;
          this.showErrorMessage('There was an error generating Summary. Please try again later.', 3000);
        }
      });
  }

  errorMessage = "There was an error displaying the Summary information. Please try again later.";
  savedsummary = true;
  chapter_summary = '';
  
  saveSummary() {
    this.chapter_summary = (this.summaryoption == 'summary1' ? this.summary1value : (this.summaryoption == 'summary2' ? this.summary2value :
      this.summary3value));
    const save_summary_payload = {
      "book_name": this.selectedBook,
      "part": this.selectedPart,
      "chapter_name": this.selectedChapter,
      "chapter_summary": this.chapter_summary,
      "summary_option": this.summaryoption,
      "doc_id": "-1"
    };
    if (this.chapter_summary == "No chapter summaries found.") {
      this.showWarnMessage("No Chapter Summary Found to Save. Please Generate a Summary and click on Save Summary.", 3000);
      return;
    }
    this.savedsummary = false;
    this.savesummarydisable = true;
    save_summary_payload['doc_id'] =
      (this.summaryoption == 'summary1' ? this.doc_id_summary_1 :
        (this.summaryoption == 'summary2' ? this.doc_id_summary_2 : this.doc_id_summary_3));
    console.log("Payload = " + JSON.stringify(save_summary_payload));
    
    //Reset corresponding generate summary clicked flags
    if(this.summaryoption == 'summary1'){
      this.generateSummary1Clicked = false;
    }
    else if(this.summaryoption == 'summary2'){
      this.generateSummary2Clicked = false;
    }
    else{
      this.generateSummary3Clicked = false;
    }

    this.http.post<any>(this.BASE_URL + '/chapter/save', save_summary_payload)
      .subscribe({
        next: (message) => {
          console.log(message['message']);
          this.savedsummary = true;
          this.savesummarydisable = false;
          if (this.summaryoption == 'summary1') {
            this.doc_id_summary_1 = message['doc_id'];
          }
          else if (this.summaryoption == 'summary2') {
            this.doc_id_summary_2 = message['doc_id'];
          }
          else {
            this.doc_id_summary_3 = message['doc_id'];
          }
          this.showSuccessMessage('Chapter Saved Successfully')
        },
        error: (err) => {
          this.savedsummary = true;
          this.savesummarydisable = false;
          this.showErrorMessage('Chapter Save Error', 1000);
        }
      });
  }

  showSuccessMessage(message: string) {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: message
    });
  }

  showWarnMessage(message: string, durationInms: number) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Warning',
      detail: message,
      life: durationInms
    });
  }

  showErrorMessage(message: string, durationInms: number) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: durationInms
    });
  }

  summaryMessagePrefix = '';
  messageWord = '';
  messageBody = '';

  setSummaryMessagePrefix() {

    this.summaryMessagePrefix = '';
    const summaries: string[] = [];

    if (this.generateSummary1Clicked) {
      summaries.push('Summary 1');
    }
    if (this.generateSummary2Clicked) {
      summaries.push('Summary 2');
    }
    if (this.generateSummary3Clicked) {
      summaries.push('Summary 3');
    }

    if((this.generateSummary1Clicked && this.generateSummary2Clicked) || (this.generateSummary1Clicked && this.generateSummary3Clicked) || 
        (this.generateSummary2Clicked && this.generateSummary3Clicked)){
          this.summaryMessagePrefix = summaries.join(' & ');
        }
        else{
          this.summaryMessagePrefix = summaries.toString();
        }
  }

  selectWording(selectionLevel: number){
    if(selectionLevel == 1){
      return "Chapter";
    }
    else if(selectionLevel == 2){
      return "Part"
    }
    else{
      return "Book"
    }
  }

  setDialogOptions(selectionLevel: number){
    this.setSummaryMessagePrefix();
    this.messageWord = this.selectWording(selectionLevel);
    this.messageBody = `<p>${this.summaryMessagePrefix} has been updated for <b>${this.previousChapter}</b>.</p>
              <p>Switching to another ${this.messageWord} would cause you to lose the updated Summary.</p>
              <p style="text-align: center; margin-top: 15px; font-weight: bold;">
                Would you like to proceed?
              </p>`
  }

  showConfirmDialog(selectionLevel: number){
    this.setDialogOptions(selectionLevel);
    this.confirmationService.confirm({
    message: this.messageBody,
    header: 'Summary Changed',
    closeOnEscape: false,
    icon: 'pi pi-exclamation-triangle',
    accept: () => 
    {
      if(selectionLevel == 1){
        this.resetSummary();
      }
      else if(selectionLevel == 2){
        this.resetSummariesAndUpdateChapterList();
      }
      else{
        this.resetSummariesAndPartsAndFetchChapterNames();
      }
    },
    reject: () => 
    {
      if(selectionLevel == SELECTION_LEVEL.CHAPTER){
        //Reset to older Chapter value in chapter dropdown.
        this.selectedChapter = this.previousChapter;
      }
      else if(selectionLevel == SELECTION_LEVEL.PART){
        //Reset to older Part value in Part dropdown.
        this.selectedPart = this.previousPart;
      }
      else{
        //Reset to older Book value in Book dropdown.
        this.selectedBook = this.previousBook;
      }
    },
    acceptLabel: 'Proceed',
    rejectLabel: 'Cancel'
   });
  }
}

enum SELECTION_LEVEL
{
  BOOK = 3, CHAPTER = 1, PART = 2
}

